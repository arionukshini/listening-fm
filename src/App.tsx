import { useMemo } from 'react';
import { LastFmProvider } from './providers/LastFmProvider';
import { useNowPlaying } from './hooks/useNowPlaying';
import { profile, POLL_INTERVAL_MS } from './config/profile';
import { relativeTime } from './utils/time';
import aotyData from './data/aoty.json';
import type { AotyData } from './types/aoty';
import { Background } from './components/Background';
import { StatusReadout } from './components/StatusReadout';
import { AlbumArt } from './components/AlbumArt';
import { TrackInfo } from './components/TrackInfo';
import { RecentlyPlayed } from './components/RecentlyPlayed';
import { ProfileLinks } from './components/ProfileLinks';
import { StateFallback } from './components/StateFallback';
import { RecentlyReviewed } from './components/RecentlyReviewed';
import { TopAlbumsOfYear } from './components/TopAlbumsOfYear';

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY || '';
const aoty = aotyData as AotyData;

export default function App() {
  const provider = useMemo(
    () => new LastFmProvider(profile.lastfmUsername, API_KEY),
    [],
  );
  const { status, current, recent, error } = useNowPlaying(provider, POLL_INTERVAL_MS);

  const showUnconfigured = error === 'missing-config';
  const showLoading = status === 'loading' && !current;
  const showError = status === 'error' && !current && !showUnconfigured;
  const showEmpty = status === 'ready' && !current;

  const hasAotyContent = aoty.recentlyReviewed.length > 0 || aoty.topOfYear.length > 0;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center px-6">
      <Background artworkUrl={current?.artworkUrl} />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-16 py-20 lg:flex-row lg:items-center lg:gap-24 lg:py-24">
        {(showUnconfigured || showLoading || showError || showEmpty) && (
          <div className="flex w-full flex-1 items-center justify-center">
            {showUnconfigured && <StateFallback kind="unconfigured" />}
            {showLoading && <StateFallback kind="loading" />}
            {showError && <StateFallback kind="error" />}
            {showEmpty && <StateFallback kind="empty" />}
          </div>
        )}

        {current && (
          <>
            <div className="flex w-full max-w-md shrink-0 flex-col items-start text-left">
              <StatusReadout
                isLive={current.isNowPlaying}
                relativeTime={current.playedAt ? relativeTime(current.playedAt) : undefined}
              />
              <div className="mt-6">
                <AlbumArt src={current.artworkUrl} alt={`${current.name} by ${current.artist}`} />
              </div>
              <div className="mt-7">
                <TrackInfo name={current.name} artist={current.artist} album={current.album} />
              </div>

              <RecentlyPlayed tracks={recent} />
              <ProfileLinks links={profile.links} />
            </div>

            {hasAotyContent && (
              <aside className="flex w-full max-w-sm flex-col gap-12 lg:pt-2">
                <RecentlyReviewed albums={aoty.recentlyReviewed} profileUrl={profile.links.aoty} />
                <TopAlbumsOfYear
                  albums={aoty.topOfYear}
                  year={aoty.year}
                  profileUrl={profile.links.aoty}
                />
                {profile.links.aoty && (
                  <a
                    href={profile.links.aoty}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-mist/50 underline-offset-4 transition-colors hover:text-paper hover:underline"
                  >
                    View all ratings on AOTY
                  </a>
                )}
              </aside>
            )}
          </>
        )}
      </main>

      <footer className="flex flex-col items-center gap-1 pb-8 text-center font-mono text-[10px] tracking-[0.15em] text-mist/30">
        <span>{profile.displayName.toUpperCase()}</span>
        <span>YOUR MUSIC, RIGHT NOW</span>
      </footer>
    </div>
  );
}
