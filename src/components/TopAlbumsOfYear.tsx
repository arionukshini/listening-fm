import type { AotyAlbumEntry } from '../types/aoty';
import { AotyAlbumRow } from './AotyAlbumRow';

interface TopAlbumsOfYearProps {
  albums: AotyAlbumEntry[];
  year: number;
  profileUrl?: string;
}

export function TopAlbumsOfYear({ albums, year, profileUrl }: TopAlbumsOfYearProps) {
  if (albums.length === 0) return null;

  return (
    <section className="w-full">
      <h2 className="font-mono text-xs tracking-[0.2em] text-mist/70">TOP ALBUMS OF {year}</h2>
      <ul className="mt-3 divide-y divide-thread">
        {albums.map((album, index) => (
          <AotyAlbumRow
            key={`${album.title}-${album.artist}`}
            entry={album}
            fallbackUrl={profileUrl}
            rank={index + 1}
          />
        ))}
      </ul>
    </section>
  );
}
