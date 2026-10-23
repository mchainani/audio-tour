import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { useEffect } from 'react';

import { useAudioSession } from './audio-session';
import { AudioUnavailable } from './audio-unavailable';
import { SeekSlider } from './seek-slider';
import { SpeedSelector } from './speed-selector';

interface ChapterPlayerProps {
  readonly loadSource: () => string | null;
  readonly title: string;
  readonly tourTitle: string;
  readonly skipForwardSeconds: number;
  readonly skipBackwardSeconds: number;
}

function formatTime(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

export function ChapterPlayer({ loadSource, title, tourTitle, skipForwardSeconds, skipBackwardSeconds }: ChapterPlayerProps) {
  const { player, state } = useAudioSession();
  useEffect(() => () => player.reset(), [player]);

  useEffect(() => {
    if (!state.requested || state.error || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist: tourTitle });
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => player.play(), pause: () => player.pause(),
      seekbackward: () => player.seek(player.getSnapshot().currentTime - skipBackwardSeconds),
      seekforward: () => player.seek(player.getSnapshot().currentTime + skipForwardSeconds),
      seekto: (event) => { if (event.seekTime !== undefined) player.seek(event.seekTime); },
    };
    for (const [action, handler] of Object.entries(handlers)) {
      try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler!); } catch { /* Browser does not support this action. */ }
    }
    return () => {
      navigator.mediaSession.metadata = null;
      for (const action of Object.keys(handlers)) {
        try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, null); } catch { /* Unsupported action. */ }
      }
    };
  }, [player, state.requested, state.error, title, tourTitle, skipForwardSeconds, skipBackwardSeconds]);

  if (state.error) return <AudioUnavailable onRetry={() => player.start(loadSource)} />;

  const loaded = state.duration > 0;
  const disabled = !loaded;
  const playDisabled = state.loading && !state.playing;
  const status = !state.requested ? null : state.loading ? 'Loading…' : state.playing ? 'Playing' : state.ended ? 'Finished' : 'Paused';
  function togglePlayback() {
    if (!state.requested) player.start(loadSource);
    else if (state.playing) player.pause();
    else player.play();
  }

  return <section className="player" aria-label="Chapter narration">
    <div className="player-heading"><p className="player-eyebrow">LISTEN TO THIS CHAPTER</p>{status && <span className="player-state" role="status">{status}</span>}</div>
    <div className="player-controls">
      <button className="skip-button" aria-label={`Back ${skipBackwardSeconds} seconds`} disabled={disabled} onClick={() => player.seek(state.currentTime - skipBackwardSeconds)}><SkipBack size={22} aria-hidden="true" /><span>{skipBackwardSeconds}s</span></button>
      <button className="play-button" aria-label={state.playing ? 'Pause narration' : state.ended ? 'Replay narration' : 'Play narration'} disabled={playDisabled} onClick={togglePlayback}>
        {state.playing ? <Pause size={26} fill="currentColor" aria-hidden="true" /> : state.ended ? <RotateCcw size={26} aria-hidden="true" /> : <Play size={26} fill="currentColor" aria-hidden="true" />}
      </button>
      <button className="skip-button" aria-label={`Forward ${skipForwardSeconds} seconds`} disabled={disabled} onClick={() => player.seek(state.currentTime + skipForwardSeconds)}><SkipForward size={22} aria-hidden="true" /><span>{skipForwardSeconds}s</span></button>
    </div>
    <SeekSlider value={Math.min(state.duration, state.currentTime)} maximumValue={state.duration || 1} disabled={disabled} valueText={`${formatTime(state.currentTime)} of ${formatTime(state.duration)}`} onSeek={player.seek} />
    <div className="player-times"><span aria-label={`Elapsed ${formatTime(state.currentTime)}`}>{formatTime(state.currentTime)}</span><span aria-label={loaded ? `Duration ${formatTime(state.duration)}` : 'Duration available after playback starts'}>{loaded ? formatTime(state.duration) : '—:—'}</span></div>
    <SpeedSelector rate={state.rate} onChange={player.setRate} />
  </section>;
}
