const test = require('node:test');
const assert = require('node:assert/strict');
const { eventDisplay, nextIndex } = require('../site-helpers.js');

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
