import type { AotyAlbumEntry } from '../types/aoty';

interface AotyAlbumRowProps {
  entry: AotyAlbumEntry;
  fallbackUrl?: string;
  /** Rank number to show, e.g. for a top-5 list. Omit for a non-ranked row. */
  rank?: number;
}

export function AotyAlbumRow({ entry, fallbackUrl, rank }: AotyAlbumRowProps) {
  const href = entry.url || fallbackUrl;

  const content = (
    <>
      {rank !== undefined && (
        <span className="w-5 shrink-0 font-mono text-sm text-mist/40">
          {String(rank).padStart(2, '0')}
        </span>
      )}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-ink">
        {entry.art ? (
          <img src={entry.art} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base text-paper">{entry.title}</p>
        <p className="truncate font-mono text-sm text-mist/70">{entry.artist}</p>
      </div>
      <span className="shrink-0 font-mono text-sm text-mist/60">{entry.score}</span>
    </>
  );

  if (!href) {
    return <li className="flex items-center gap-4 py-3.5">{content}</li>;
  }

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 py-3.5 transition-opacity hover:opacity-70"
      >
        {content}
      </a>
    </li>
  );
}
