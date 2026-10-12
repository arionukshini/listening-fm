type IconProps = { className?: string };

/** Circle with a fanning soundwave — reads as "streaming" at a glance. */
export function SpotifyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M6.8 9.6a9 9 0 0 1 10.4 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.4 12.6a7 7 0 0 1 8.2 1.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.1 15.5a5 5 0 0 1 6 1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Circle with a broadcast signal — the ".fm" / radio association. */
export function LastFmIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="9" cy="14.2" r="1.3" fill="currentColor" />
      <path
        d="M9 10.8a4.6 4.6 0 0 1 4.6 4.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9 7.6a7.8 7.8 0 0 1 7.8 7.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Rounded badge with a star — the ratings/review association. */
export function AotyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12 7.6l1.47 2.98 3.29.48-2.38 2.32.56 3.28L12 15.1l-2.94 1.56.56-3.28-2.38-2.32 3.29-.48L12 7.6Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
    </svg>
  );
}
