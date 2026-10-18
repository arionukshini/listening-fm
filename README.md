# listening.fm

A personal "now playing" status page. Shows what you're listening to right
now (or the last thing you played), backed by Last.fm, with a background
that shifts atmosphere based on the album artwork.

_Your music, right now._

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `VITE_LASTFM_API_KEY` — from https://www.last.fm/api/account/create
- `VITE_LASTFM_USERNAME` — the Last.fm account to display
- `VITE_DISPLAY_NAME`, `VITE_SPOTIFY_URL`, `VITE_AOTY_URL` — optional profile info

```bash
npm run dev
```

Build for production with `npm run build`; output lands in `dist/`.

## Architecture

Data fetching is fully separated from the UI behind a provider interface
(`src/types/music.ts#MusicProvider`). Version 1 ships one implementation:

```
MusicProvider (interface)
└── LastFmProvider   — src/providers/LastFmProvider.ts
```

`useNowPlaying` (a hook) polls whatever provider it's given and exposes a
normalized `NowPlayingState`. Every component downstream (`AlbumArt`,
`TrackInfo`, `RecentlyPlayed`, ...) only ever sees the normalized `Track`
shape — nothing in `src/components` knows Last.fm exists.

This means a future `SpotifyProvider` (or a provider that merges both, using
Spotify for exact playback progress and Last.fm as the scrobble history) can
be dropped in without touching any UI code — just implement `MusicProvider`
and swap what `App.tsx` constructs.

`src/config/profile.ts` holds the single-profile config for V1. It's shaped
so that a future multi-user version can replace the static object with a
fetch keyed by an `/@username` route param without changing its consumers:

```ts
{
  displayName,
  lastfmUsername,
  links: { spotify, lastfm, aoty }
}
```

## Notable behavior

- Polls every `VITE_POLL_INTERVAL_MS` (default 15s), pauses while the tab is
  hidden, and refetches immediately when it becomes visible again.
- Ambient background color is sampled live from the current album artwork
  (`src/utils/ambientColor.ts`) — best-effort, and falls back to a neutral
  glow if the image can't be read (e.g. blocked by CORS).
- Missing artwork, API failures, and an unconfigured `.env` each get their
  own tasteful fallback state instead of a blank screen or console error.
- No playback progress bar — Last.fm doesn't report elapsed time, and this
  intentionally doesn't fake one. That's the kind of thing a future
  Spotify-backed provider could add.

## Album of the Year data

The "Recently Reviewed" and "Top Albums of Year" panels read from
`src/data/aoty.json`. There's no public AOTY API, and its `robots.txt`
explicitly disallows AI/data-collection crawlers site-wide, so nothing here
ever scrapes it — this file only ever changes because you tell it to,
one of two ways:

**Fastest: the "Update Albums" GitHub Action.** Repo → **Actions** tab →
**Update Albums** → **Run workflow**. Fill in list (recent / top5), title,
artist, score — it updates `aoty.json`, commits it, and deploys the new
commit in the same workflow. There is no second deploy action to run. No
local git, no editing JSON by hand, works from a phone browser. Re-submitting
the same title/artist updates that entry instead of duplicating it;
`topOfYear` keeps itself sorted and capped at the top 5 by score,
`recentlyReviewed` keeps the 3 most recent.

For several albums at once, leave the single-album fields blank and paste one
line per album into the **albums** field using this format:

```text
recent | Album title | Artist | 85 | https://www.albumoftheyear.org/album/... | optional-art-url
top5 | Another album | Artist | 92 | https://www.albumoftheyear.org/album/...
```

The first `recent` line is treated as the newest. All lines are committed and
deployed together, so a batch only waits for one build.

This is a one-click *push*, not a background *poll* — nothing watches AOTY
or runs on a schedule, you still tell it about each album yourself. That
part can't be automated away (see above), only made fast.

**Or: edit the file directly** (handy for bulk changes, or reordering
things by hand):

```json
{
  "year": 2026,
  "recentlyReviewed": [
    { "title": "...", "artist": "...", "score": 85 }
  ],
  "topOfYear": [
    { "title": "...", "artist": "...", "score": 100 }
  ]
}
```

`art` (cover image URL) and `url` (direct AOTY album/review link) are optional
on each entry.

- **`url`** — add the album page or your specific review/rating page so the
  row opens that entry directly. If omitted, it links to your overall AOTY
  profile.
- **`art`** — leave it out and the page looks it up automatically at load
  time via Last.fm's `album.getinfo` (`src/utils/albumArt.ts`), using the
  same API key as the rest of the site. If Last.fm doesn't recognize the
  exact title, it retries once with a trailing edition suffix like
  "(2024 reissue)" or "(Digital Deluxe)" stripped off. If it still can't
  find anything, the row falls back to a plain placeholder — just set `art`
  by hand on that entry to override it.

Either panel disappears automatically if you leave its list empty.

## Deploying to GitHub Pages

The actual build-and-deploy steps live in `.github/workflows/build-deploy.yml`,
a reusable workflow. Two things call it: `deploy.yml` (on every push to
`main`), and `update-albums.yml` (right after it commits an album update) —
both end up running the same build. To turn it on:

1. **Push this repo to GitHub.**
2. **Add your env values as repo secrets** — Settings → Secrets and variables
   → Actions → New repository secret — one for each of `VITE_LASTFM_API_KEY`,
   `VITE_LASTFM_USERNAME`, `VITE_DISPLAY_NAME`, `VITE_SPOTIFY_URL`,
   `VITE_AOTY_URL`, `VITE_POLL_INTERVAL_MS`.

   Faster: with the [GitHub CLI](https://cli.github.com) installed and
   authenticated (`gh auth login`), fill in a real `.env` (drop any line
   you're leaving blank) and run `gh secret set --env-file .env` from the
   repo folder — it creates all of them in one shot. Check with
   `gh secret list`.
3. **Set the base path** in `.github/workflows/build-deploy.yml`:
   - Repo is a *project* page (site will live at `username.github.io/repo-name/`) →
     keep `VITE_BASE_PATH: /repo-name/`, matching your actual repo name.
   - Repo is a *user/org* page (named exactly `username.github.io`) or you're
     using a custom domain → delete that `VITE_BASE_PATH` line entirely.
4. **Enable Pages** — Settings → Pages → Build and deployment → Source:
   **GitHub Actions**.
5. Push to `main` (or run `deploy.yml` manually from the Actions tab) and the
   site deploys automatically.

If `main` has branch protection rules requiring pull requests, the "Update
Albums" workflow (which pushes straight to `main`) will fail — it needs
direct push access, same as you'd use locally.

**Why `build-deploy.yml` is split out:** a push made by the Actions bot's
own default token doesn't trigger other workflows' `on: push` — GitHub
blocks that specifically to prevent infinite workflow loops. The update
workflow therefore calls the reusable build/deploy job itself and passes the
exact commit it just pushed, so the first deploy contains the new album data.

**Heads up:** Vite inlines `VITE_*` env vars into the built JS at compile
time. That means once deployed, your Last.fm API key is visible to anyone
who views the page source or network tab — this is true of any client-only
static deploy, not specific to GitHub Pages. Fine for a personal page given
Last.fm's key is rate-limited and read-only, but don't reuse that key
anywhere it needs to stay private.

## Notes for a future multi-user platform

- The Last.fm API key is currently read client-side via Vite env vars,
  which is fine for a single self-hosted profile. A multi-tenant version
  should move the fetch behind a small server route so each user isn't
  exposing (or sharing) the same key.
- Routing is intentionally absent in V1 — there's exactly one profile.
  Adding `/@username` is mostly a matter of resolving `profile` from a
  route param instead of `import.meta.env`.
