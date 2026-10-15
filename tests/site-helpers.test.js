const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calendarRequestUrl,
  calendarStatus,
  eventDisplay,
  nextIndex,
  selectUpcomingEvents,
} = require('../site-helpers.js');

test('formats an all-day event without a time', () => {
  assert.deepEqual(eventDisplay({
    summary: 'Harvest Market',
    start: { date: '2026-10-18' },
    end: { date: '2026-10-19' },
  }, 'America/New_York'), {
    title: 'Harvest Market',
    day: '18',
    month: 'OCT',
    dateLabel: 'Sunday, October 18',
    timeLabel: 'All day',
    location: '',
  });
});

test('formats a timed event in the configured calendar zone', () => {
  const result = eventDisplay({
    summary: 'Aura readings',
    location: 'The Rooted Cup',
    start: { dateTime: '2026-10-06T11:00:00-04:00' },
    end: { dateTime: '2026-10-06T16:00:00-04:00' },
  }, 'America/New_York');

  assert.equal(result.day, '6');
  assert.equal(result.month, 'OCT');
  assert.equal(result.dateLabel, 'Tuesday, October 6');
  assert.equal(result.timeLabel, '11:00 AM – 4:00 PM');
  assert.equal(result.location, 'The Rooted Cup');
});

test('uses a date range for a multi-day all-day event', () => {
  const result = eventDisplay({
    summary: 'Wellness Weekend',
    start: { date: '2026-10-24' },
    end: { date: '2026-10-27' },
  }, 'America/New_York');

  assert.equal(result.dateLabel, 'Saturday, October 24 – Monday, October 26');
  assert.equal(result.timeLabel, 'All day');
});

test('wraps carousel indexes in either direction', () => {
  assert.equal(nextIndex(0, 3, -1), 2);
  assert.equal(nextIndex(2, 3, 1), 0);
  assert.equal(nextIndex(1, 3, 1), 2);
});

test('builds a three-month upcoming-event request for the configured calendar', () => {
  const url = new URL(calendarRequestUrl({
    apiKey: 'calendar-key',
    calendarId: 'labellelight@gmail.com',
  }, new Date('2026-10-14T16:30:00Z')));

  assert.equal(url.pathname, '/calendar/v3/calendars/labellelight%40gmail.com/events');
  assert.equal(url.searchParams.get('key'), 'calendar-key');
  assert.equal(url.searchParams.get('singleEvents'), 'true');
  assert.equal(url.searchParams.get('orderBy'), 'startTime');
  assert.equal(url.searchParams.get('timeMin'), '2026-10-14T16:30:00.000Z');
  assert.equal(url.searchParams.get('timeMax'), '2027-01-12T16:30:00.000Z');
  assert.equal(url.searchParams.get('maxResults'), '2500');
  assert.equal(url.searchParams.get('fields'), 'items(summary,start,end,location)');
});

test('returns every event in the next 30 days plus five in the following two months', () => {
  const now = new Date('2026-10-14T12:00:00Z');
  const nearEvents = [
    { start: { dateTime: '2026-10-15T12:00:00Z' } },
    { start: { dateTime: '2026-10-18T12:00:00Z' } },
    { start: { dateTime: '2026-10-22T12:00:00Z' } },
    { start: { dateTime: '2026-10-27T12:00:00Z' } },
    { start: { dateTime: '2026-11-02T12:00:00Z' } },
    { start: { dateTime: '2026-11-09T12:00:00Z' } },
  ];
  const followingEvents = [
    { summary: '1', start: { dateTime: '2026-11-15T12:00:00Z' } },
    { summary: '2', start: { dateTime: '2026-11-20T12:00:00Z' } },
    { summary: '3', start: { dateTime: '2026-12-01T12:00:00Z' } },
    { summary: '4', start: { dateTime: '2026-12-20T12:00:00Z' } },
    { summary: '5', start: { dateTime: '2027-01-01T12:00:00Z' } },
    { summary: 'excluded', start: { dateTime: '2027-01-05T12:00:00Z' } },
  ];

  const selected = selectUpcomingEvents([...nearEvents, ...followingEvents], now);
  assert.equal(selected.length, 11);
  assert.equal(selected[10].summary, '5');
});

test('reports a warm empty or request-failure calendar state', () => {
  assert.equal(calendarStatus([]), 'No dates are on the calendar just yet. Check back soon.');
  assert.equal(calendarStatus([], true), 'Upcoming dates are taking a moment to load. Please use the full calendar link.');
});
