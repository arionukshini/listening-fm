export interface LastFmImageLike {
  size: string;
  '#text': string;
}

const MISSING_ART_HASH = '2a96cbd8b46e442fc41c2b86b821562f';

/**
 * Picks the largest usable image from a Last.fm image array (smallest ->
 * largest), treating Last.fm's known grey "no art" placeholder as absent.
 * Shared by track artwork (LastFmProvider) and album artwork (albumArt).
 */
export function pickBestImage(images: LastFmImageLike[] | undefined): string | undefined {
  if (!images) return undefined;
  for (let i = images.length - 1; i >= 0; i -= 1) {
    const url = images[i]['#text'];
    if (url && !url.includes(MISSING_ART_HASH)) {
      return url;
    }
  }
  return undefined;
}
