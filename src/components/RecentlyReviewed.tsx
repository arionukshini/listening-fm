import type { AotyAlbumEntry } from '../types/aoty';
import { AotyAlbumRow } from './AotyAlbumRow';

interface RecentlyReviewedProps {
  albums: AotyAlbumEntry[];
  profileUrl?: string;
}

export function RecentlyReviewed({ albums, profileUrl }: RecentlyReviewedProps) {
  if (albums.length === 0) return null;

  return (
    <section className="w-full">
      <h2 className="font-mono text-xs tracking-[0.2em] text-mist/70">RECENTLY REVIEWED</h2>
      <ul className="mt-3 divide-y divide-thread">
        {albums.map((album) => (
          <AotyAlbumRow key={`${album.title}-${album.artist}`} entry={album} fallbackUrl={profileUrl} />
        ))}
      </ul>
    </section>
  );
}
