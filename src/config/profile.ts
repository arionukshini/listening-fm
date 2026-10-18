/**
 * V1 supports a single hardcoded profile. This shape is deliberately the
 * same shape a future /@username multi-profile lookup would return, so
 * swapping a static object for a fetched one later is a non-breaking change.
 */
export interface Profile {
  displayName: string;
  lastfmUsername: string;
  links: {
    spotify?: string;
    lastfm?: string;
    aoty?: string;
  };
}

export const profile: Profile = {
  displayName: import.meta.env.VITE_DISPLAY_NAME || 'Arion',
  lastfmUsername: import.meta.env.VITE_LASTFM_USERNAME || '',
  links: {
    spotify: import.meta.env.VITE_SPOTIFY_URL || undefined,
    lastfm: import.meta.env.VITE_LASTFM_USERNAME
      ? `https://www.last.fm/user/${import.meta.env.VITE_LASTFM_USERNAME}`
      : undefined,
    aoty: import.meta.env.VITE_AOTY_URL || undefined,
  },
};

/** How often to poll the provider for updates, in ms. */
export const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 15_000;

/** How many recent tracks to show before "Show more" is pressed. */
export const RECENT_PREVIEW_COUNT = 3;

/** Maximum number of entries shown in the Recently Reviewed panel. */
export const RECENT_REVIEWED_CAP = 3;
