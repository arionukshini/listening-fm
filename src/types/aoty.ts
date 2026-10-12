/**
 * Hand-maintained data from Album of the Year. There's no public AOTY API,
 * and automated scraping is a non-starter here — albumoftheyear.org's
 * robots.txt explicitly disallows AI/data-collection crawlers site-wide.
 * So this stays manual: edit src/data/aoty.json whenever you want to
 * update it, no build step required.
 */
export interface AotyAlbumEntry {
  title: string;
  artist: string;
  /** AOTY score, 0–100. */
  score: number;
  /** Album cover URL. Omit it and the UI falls back to a plain placeholder. */
  art?: string;
  /** Deep link to the review/rating. Omit it and the UI links to your AOTY profile instead. */
  url?: string;
}

export interface AotyData {
  /** The year topOfYear is ranked for, e.g. 2026. Shown in the panel heading. */
  year: number;
  recentlyReviewed: AotyAlbumEntry[];
  topOfYear: AotyAlbumEntry[];
}
