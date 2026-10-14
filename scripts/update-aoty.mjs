#!/usr/bin/env node
/**
 * Updates src/data/aoty.json from env vars (LIST, TITLE, ARTIST, SCORE,
 * URL, ART, YEAR). Built to be called from the "Update Albums"
 * GitHub Actions workflow (workflow_dispatch form), but runs the same way
 * locally — e.g. for a one-off fix without going through the Actions UI:
 *
 *   LIST=top5 TITLE="..." ARTIST="..." SCORE=90 node scripts/update-aoty.mjs
 *
 * Deliberately has zero dependencies beyond Node's own fs — nothing here
 * ever talks to the network, let alone AOTY.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DATA_PATH = fileURLToPath(new URL('../src/data/aoty.json', import.meta.url));

const RECENT_CAP = 5;
const TOP_CAP = 5;

function fail(message) {
  console.error(`update-aoty: ${message}`);
  process.exit(1);
}

const listInput = (process.env.LIST || '').trim();
const title = (process.env.TITLE || '').trim();
const artist = (process.env.ARTIST || '').trim();
const scoreRaw = process.env.SCORE;
const url = (process.env.URL || '').trim();
const art = (process.env.ART || '').trim();
const yearRaw = (process.env.YEAR || '').trim();

const LIST_MAP = { recent: 'recentlyReviewed', top5: 'topOfYear' };
const list = LIST_MAP[listInput];

if (!list) {
  fail(`LIST must be "recent" or "top5" (got "${listInput}").`);
}
if (!title) fail('TITLE is required.');
if (!artist) fail('ARTIST is required.');

const score = Number(scoreRaw);
if (!Number.isFinite(score) || score < 0 || score > 100) {
  fail(`SCORE must be a number 0-100 (got "${scoreRaw}").`);
}

const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

const entry = { title, artist, score };
if (url) entry.url = url;
if (art) entry.art = art;

const key = (e) => `${e.artist.toLowerCase()}::${e.title.toLowerCase()}`;
const entryKey = key(entry);

if (list === 'recentlyReviewed') {
  // Newest first; re-submitting an existing title/artist updates it in
  // place (moves it to the front) instead of creating a duplicate row.
  data.recentlyReviewed = [
    entry,
    ...data.recentlyReviewed.filter((e) => key(e) !== entryKey),
  ].slice(0, RECENT_CAP);
} else {
  // Ranked by score; re-submitting an existing title/artist updates its
  // score instead of creating a duplicate row.
  data.topOfYear = [...data.topOfYear.filter((e) => key(e) !== entryKey), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_CAP);
}

if (yearRaw) {
  const year = Number(yearRaw);
  if (Number.isFinite(year)) data.year = year;
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n');
console.log(`Updated "${list}" with:`, entry);
