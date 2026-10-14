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

  return { eventDisplay, nextIndex };
}));
