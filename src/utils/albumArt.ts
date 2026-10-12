import { pickBestImage } from './lastfmImages';

const API_ROOT = 'https://ws.audioscrobbler.com/2.0/';

interface AlbumGetInfoResponse {
  album?: { image?: { size: string; '#text': string }[] };
  error?: number;
}

async function lookupAlbumArt(
  apiKey: string,
  artist: string,
  album: string,
): Promise<string | undefined> {
  const params = new URLSearchParams({
    method: 'album.getinfo',
    api_key: apiKey,
    artist,
    album,
    format: 'json',
  });

  try {
    const res = await fetch(`${API_ROOT}?${params.toString()}`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as AlbumGetInfoResponse;
    if (data.error) return undefined;
    return pickBestImage(data.album?.image);
  } catch {
    return undefined;
  }
}

/** Strips a trailing parenthetical like "(2024 reissue)" or "(Digital Deluxe)". */
function stripEdition(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/**
 * Resolves cover art for an artist/album pair via Last.fm's album.getinfo —
 * a public API call, not AOTY scraping. AOTY entries are often a specific
 * reissue/deluxe edition Last.fm doesn't list separately, so this retries
 * once with any trailing "(...)" edition suffix stripped before giving up.
 */
export async function resolveAlbumArt(
  apiKey: string,
  artist: string,
  album: string,
): Promise<string | undefined> {
  if (!apiKey || !artist || !album) return undefined;

  const direct = await lookupAlbumArt(apiKey, artist, album);
  if (direct) return direct;

  const stripped = stripEdition(album);
  if (stripped && stripped !== album) {
    return lookupAlbumArt(apiKey, artist, stripped);
  }

  return undefined;
}

export function albumArtKey(entry: { artist: string; title: string }): string {
  return `${entry.artist}::${entry.title}`;
}
