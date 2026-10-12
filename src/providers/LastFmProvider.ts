import type { MusicProvider, NowPlayingState, Track } from '../types/music';
import type { LastFmRecentTracksResponse, LastFmTrack } from './lastfm.types';
import { pickBestImage } from '../utils/lastfmImages';

const API_ROOT = 'https://ws.audioscrobbler.com/2.0/';

function normalize(track: LastFmTrack, index: number): Track {
  const isNowPlaying = track['@attr']?.nowplaying === 'true';
  return {
    id: `${track.mbid || track.name}-${track.date?.uts ?? index}`,
    name: track.name,
    artist: track.artist['#text'],
    album: track.album?.['#text'] || undefined,
    artworkUrl: pickBestImage(track.image),
    playedAt: track.date?.uts ? Number(track.date.uts) * 1000 : undefined,
    isNowPlaying,
    url: track.url,
  };
}

export class LastFmProvider implements MusicProvider {
  constructor(
    private readonly username: string,
    private readonly apiKey: string,
    private readonly limit: number = 11,
  ) {}

  async getNowPlaying(): Promise<NowPlayingState> {
    if (!this.username || !this.apiKey) {
      return {
        status: 'error',
        current: null,
        recent: [],
        error: 'missing-config',
      };
    }

    const params = new URLSearchParams({
      method: 'user.getrecenttracks',
      user: this.username,
      api_key: this.apiKey,
      format: 'json',
      limit: String(this.limit),
    });

    let response: Response;
    try {
      response = await fetch(`${API_ROOT}?${params.toString()}`);
    } catch {
      return { status: 'error', current: null, recent: [], error: 'network' };
    }

    if (!response.ok) {
      return { status: 'error', current: null, recent: [], error: `http-${response.status}` };
    }

    const data = (await response.json()) as LastFmRecentTracksResponse;

    if (data.error || !data.recenttracks?.track) {
      return { status: 'error', current: null, recent: [], error: data.message || 'unknown' };
    }

    const rawTracks = data.recenttracks.track;
    if (rawTracks.length === 0) {
      return { status: 'ready', current: null, recent: [] };
    }

    const [first, ...rest] = rawTracks.map((t, i) => normalize(t, i));

    return {
      status: 'ready',
      current: first,
      recent: rest,
    };
  }
}
