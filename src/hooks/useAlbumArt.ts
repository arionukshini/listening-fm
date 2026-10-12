import { useEffect, useRef, useState } from 'react';
import type { AotyAlbumEntry } from '../types/aoty';
import { resolveAlbumArt, albumArtKey } from '../utils/albumArt';

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY || '';

/**
 * Resolves cover art for AOTY entries that don't already specify one, via
 * Last.fm's album.getinfo. Returns a map of "artist::title" -> art url for
 * whatever it manages to resolve; entries that already set `art`, or that
 * Last.fm doesn't recognize, are simply absent from the map and the
 * caller's own fallback (a plain placeholder) applies.
 */
export function useAlbumArt(entries: AotyAlbumEntry[]): Record<string, string> {
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const attempted = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;

    entries
      .filter((entry) => !entry.art)
      .forEach((entry) => {
        const key = albumArtKey(entry);
        if (attempted.current.has(key)) return;
        attempted.current.add(key);

        resolveAlbumArt(API_KEY, entry.artist, entry.title).then((url) => {
          if (cancelled || !url) return;
          setResolved((prev) => ({ ...prev, [key]: url }));
        });
      });

    return () => {
      cancelled = true;
    };
  }, [entries]);

  return resolved;
}
