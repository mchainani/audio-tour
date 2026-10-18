export interface PlaybackState {
  readonly requested: boolean;
  readonly loading: boolean;
  readonly playing: boolean;
  readonly ended: boolean;
  readonly currentTime: number;
  readonly duration: number;
  readonly rate: number;
  readonly error: string | null;
}

type AudioMedia = Pick<HTMLAudioElement, 'src' | 'preload' | 'currentTime' | 'duration' | 'playbackRate' | 'preservesPitch' | 'paused' | 'ended' | 'readyState' | 'play' | 'pause' | 'load' | 'removeAttribute' | 'addEventListener' | 'removeEventListener'>;
const idle = { requested: false, loading: false, playing: false, ended: false, currentTime: 0, duration: 0, error: null };
const events = ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'playing', 'pause', 'ended', 'waiting', 'canplay', 'error', 'ratechange'];

/** A single browser player, created only when Play is requested. */
export class AudioPlayback {
  private readonly createMedia: () => AudioMedia;
  private media: AudioMedia | null = null;
  private detach: (() => void) | null = null;
  private state: PlaybackState = { ...idle, rate: 1 };
  private readonly listeners = new Set<() => void>();

  constructor(createMedia: () => AudioMedia = () => new Audio()) {
    this.createMedia = createMedia;
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private update(patch: Partial<PlaybackState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  private release() {
    this.detach?.();
    this.detach = null;
    const media = this.media;
    this.media = null;
    if (media) {
      media.pause();
      media.removeAttribute('src');
      media.load();
    }
  }

  reset = () => {
    this.release();
    this.update(idle);
  };

  setRate = (rate: number) => {
    if (![0.75, 1, 1.25, 1.5, 2].includes(rate)) return;
    this.update({ rate });
    if (this.media) {
      this.media.preservesPitch = true;
      this.media.playbackRate = rate;
    }
  };

  start = (loadSource: () => string | null) => {
    this.reset();
    this.update({ requested: true, loading: true });
    try {
      const source = loadSource();
      if (!source) {
        this.update({ loading: false, error: 'No narration is available for this chapter.' });
        return;
      }
      const media = this.createMedia();
      this.media = media;
      const sync = (event: Event) => {
        if (this.media !== media) return;
        if (event.type === 'error') {
          this.update({ loading: false, playing: false, error: 'Narration could not load. Please try again.' });
          return;
        }
        if (media.playbackRate !== this.state.rate) media.playbackRate = this.state.rate;
        const duration = Number.isFinite(media.duration) ? Math.max(0, media.duration) : 0;
        this.update({
          duration,
          currentTime: Number.isFinite(media.currentTime) ? Math.max(0, media.currentTime) : 0,
          playing: !media.paused && !media.ended,
          ended: event.type === 'ended' || media.ended,
          loading: !media.paused && (event.type === 'waiting' || media.readyState === 0),
        });
      };
      events.forEach((event) => media.addEventListener(event, sync));
      this.detach = () => events.forEach((event) => media.removeEventListener(event, sync));
      media.preload = 'none';
      media.src = source;
      media.preservesPitch = true;
      media.playbackRate = this.state.rate;
      this.play();
    } catch {
      this.update({ loading: false, playing: false, error: 'Could not load this narration. Please try again.' });
    }
  };

  play = () => {
    const media = this.media;
    if (!media) return;
    if (media.ended || (this.state.duration > 0 && media.currentTime >= this.state.duration)) {
      media.currentTime = 0;
      this.update({ currentTime: 0, ended: false });
    }
    media.preservesPitch = true;
    media.playbackRate = this.state.rate;
    media.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (this.media === media) {
        this.update({ loading: false, playing: false, error: 'Could not play this narration. Please try again.' });
      }
    });
  };

  pause = () => { this.media?.pause(); };

  seek = (seconds: number) => {
    if (!this.media || this.state.duration <= 0 || !Number.isFinite(seconds)) return;
    try {
      const currentTime = Math.max(0, Math.min(this.state.duration, seconds));
      this.media.currentTime = currentTime;
      this.update({ currentTime, ended: currentTime >= this.state.duration });
    } catch {
      this.update({ error: 'Could not change playback position. Try loading the audio again.' });
    }
  };
}
