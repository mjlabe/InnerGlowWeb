(function attachSiteHelpers(root, factory) {
  const helpers = factory();
  if (typeof module === 'object' && module.exports) module.exports = helpers;
  root.SiteHelpers = helpers;
}(typeof globalThis === 'undefined' ? this : globalThis, function createHelpers() {
  const parts = (date, options) => Object.fromEntries(
    new Intl.DateTimeFormat('en-US', options)
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value]),
  );

  const dateOnly = value => new Date(`${value}T12:00:00Z`);
  const previousDate = value => new Date(dateOnly(value).getTime() - 86400000);
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);

  const fullDate = (date, timeZone) => {
    const dateParts = parts(date, { weekday: 'long', month: 'long', day: 'numeric', timeZone });
    return `${dateParts.weekday}, ${dateParts.month} ${dateParts.day}`;
  };

  const time = (value, timeZone) => new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone,
  }).format(new Date(value));

  function eventDisplay(event, timeZone) {
    const allDay = Boolean(event.start && event.start.date);
    const start = allDay ? dateOnly(event.start.date) : new Date(event.start.dateTime);
    const end = allDay ? previousDate(event.end.date) : new Date(event.end.dateTime);
    const displayZone = allDay ? 'UTC' : timeZone;
    const tile = parts(start, { month: 'short', day: 'numeric', timeZone: displayZone });
    const startLabel = fullDate(start, displayZone);
    const endLabel = fullDate(end, displayZone);

    return {
      title: event.summary || 'Upcoming event',
      day: tile.day,
      month: tile.month.toUpperCase(),
      dateLabel: startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`,
      timeLabel: allDay ? 'All day' : `${time(event.start.dateTime, timeZone)} – ${time(event.end.dateTime, timeZone)}`,
      location: event.location || '',
    };
  }

  function nextIndex(current, total, direction) {
    return (current + direction + total) % total;
  }

  function calendarRequestUrl(config, now) {
    const params = new URLSearchParams({
      key: config.apiKey,
      singleEvents: 'true',
      orderBy: 'startTime',
      timeMin: now.toISOString(),
      timeMax: addDays(now, 90).toISOString(),
      maxResults: '2500',
      fields: 'items(summary,start,end,location)',
    });
    const calendarId = encodeURIComponent(config.calendarId);
    return `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`;
  }

  function selectUpcomingEvents(events, now) {
    const nearEnd = addDays(now, 30).getTime();
    const followingEnd = addDays(now, 90).getTime();
    const eventTime = event => {
      const value = event.start?.dateTime || event.start?.date;
      return value ? new Date(value).getTime() : NaN;
    };
    const inRange = events.filter(event => {
      const start = eventTime(event);
      return start >= now.getTime() && start <= followingEnd;
    });
    const nearEvents = inRange.filter(event => eventTime(event) <= nearEnd);
    const followingEvents = inRange.filter(event => eventTime(event) > nearEnd);

    return [...nearEvents, ...followingEvents.slice(0, 5)];
  }

  function calendarStatus(events, failed = false) {
    if (failed) return 'Upcoming dates are taking a moment to load. Please use the full calendar link.';
    return events.length ? '' : 'No dates are on the calendar just yet. Check back soon.';
  }

  return { calendarRequestUrl, calendarStatus, eventDisplay, nextIndex, selectUpcomingEvents };
}));
