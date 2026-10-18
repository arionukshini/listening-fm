#!/usr/bin/env node
/**
 * Updates src/data/aoty.json from env vars (LIST, TITLE, ARTIST, SCORE,
 * URL, ART, YEAR). For bulk updates, set ALBUMS to one pipe-separated entry
 * per line: list | title | artist | score | url | art. Built to be called from the "Update Albums"
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

const RECENT_CAP = 3;
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
const albumsInput = (process.env.ALBUMS || '').trim();

const LIST_MAP = { recent: 'recentlyReviewed', top5: 'topOfYear' };

function parseList(value, context = 'LIST') {
  const list = LIST_MAP[value];
  if (!list) fail(`${context} must be "recent" or "top5" (got "${value}").`);
  return list;
}

function parseScore(value, context = 'SCORE') {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    fail(`${context} must be a number 0-100 (got "${value}").`);
  }
  return score;
}

function makeEntry({ title: entryTitle, artist: entryArtist, score: entryScore, url: entryUrl, art: entryArt }) {
  if (!entryTitle) fail('TITLE is required.');
  if (!entryArtist) fail('ARTIST is required.');

  const entry = { title: entryTitle, artist: entryArtist, score: parseScore(entryScore) };
  if (entryUrl) entry.url = entryUrl;
  if (entryArt) entry.art = entryArt;
  return entry;
}

function parseUpdates() {
  if (!albumsInput) {
    return [{
      list: parseList(listInput),
      entry: makeEntry({ title, artist, score: scoreRaw, url, art }),
    }];
  }

  const updates = albumsInput
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line && !line.startsWith('#'))
    .map(({ line, lineNumber }) => {
      const parts = line.split('|').map((part) => part.trim());
      if (parts.length < 4 || parts.length > 6) {
        fail(`ALBUMS line ${lineNumber} must be: list | title | artist | score | url | art`);
      }

      const [entryList, entryTitle, entryArtist, entryScore, entryUrl = '', entryArt = ''] = parts;
      return {
        list: parseList(entryList, `ALBUMS line ${lineNumber}`),
        entry: makeEntry({
          title: entryTitle,
          artist: entryArtist,
          score: entryScore,
          url: entryUrl,
          art: entryArt,
        }),
      };
    });

  if (updates.length === 0) fail('ALBUMS did not contain any entries.');
  return updates;
}

const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

const key = (e) => `${e.artist.toLowerCase()}::${e.title.toLowerCase()}`;
const updates = parseUpdates();

function applyUpdate(list, entry) {
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
}

// In a batch, the first recent line is the newest, so apply those lines in
// reverse order because each recent update is prepended to the list.
for (const update of updates.slice().reverse()) {
  applyUpdate(update.list, update.entry);
}

if (yearRaw) {
  const year = Number(yearRaw);
  if (Number.isFinite(year)) data.year = year;
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n');
console.log(`Updated ${updates.length} album${updates.length === 1 ? '' : 's'}.`);
