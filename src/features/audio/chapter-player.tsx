import Ionicons from '@expo/vector-icons/Ionicons';
import { type AudioSource, useAudioPlayerStatus } from 'expo-audio';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

import { useAudioSession } from './audio-session';
import { SeekSlider } from './seek-slider';

interface ChapterPlayerProps {
  readonly loadSource: () => AudioSource;
  readonly title: string;
  readonly tourTitle: string;
}

function formatTime(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

export function ChapterPlayer({ loadSource, title, tourTitle }: ChapterPlayerProps) {
  const { player, ready, error: sessionError } = useAudioSession();
  const status = useAudioPlayerStatus(player);
  const focused = useRef(false);
  const activation = useRef(0);
  const requested = useRef(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [seeking, setSeeking] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);

  useFocusEffect(useCallback(() => {
    activation.current += 1;
    focused.current = true;
    requested.current = false;
    setHasRequested(false);
    setCommandError(null);
    setDragPosition(null);
    setSeeking(false);
    player.pause();
    player.replace(null);
    return () => {
      activation.current += 1;
      focused.current = false;
      player.pause();
      if (Platform.OS !== 'web') {
        player.clearLockScreenControls();
      }
      player.replace(null);
    };
  }, [player]));

  // replace() clears the player immediately; the preceding source's event can still be in React state.
  const sourceLoaded = hasRequested && status.isLoaded && player.isLoaded;
  const duration = sourceLoaded && Number.isFinite(status.duration) ? Math.max(0, status.duration) : 0;
  const currentTime = Number.isFinite(status.currentTime) ? status.currentTime : 0;
  const position = Math.min(duration, Math.max(0, dragPosition ?? currentTime));
  const error = sessionError || commandError || (hasRequested && status.error ? 'Narration could not load. Please try again.' : null);
  const loaded = ready && sourceLoaded && duration > 0;
  const disabled = !loaded || !!error || seeking;
  const loading = !ready || (hasRequested && !loaded && !error);
  const playDisabled = !ready || loading || !!error || seeking;
  const finished = loaded && (status.didJustFinish || status.currentTime >= duration);

  function startPlayback() {
    activation.current += 1;
    requested.current = true;
    setHasRequested(true);
    setCommandError(null);
    setDragPosition(null);
    setSeeking(false);
    try {
      // Resolve and open audio only in response to Play or Retry, preserving the browser's user gesture.
      const source = loadSource();
      if (!source) {
        setCommandError('No narration is available for this chapter.');
        return;
      }
      player.pause();
      player.replace(source);
      if (Platform.OS !== 'web') {
        player.setActiveForLockScreen(true, { title, artist: tourTitle });
      }
      player.play();
    } catch {
      setCommandError('Could not load this narration. Please try again.');
    }
  }

  async function seek(seconds: number) {
    if (disabled) {
      return;
    }
    const requestActivation = activation.current;
    setSeeking(true);
    try {
      await player.seekTo(Math.max(0, Math.min(duration, seconds)));
    } catch {
      if (focused.current && activation.current === requestActivation) {
        setCommandError('Could not change the playback position. Try loading the audio again.');
      }
    } finally {
      if (focused.current && activation.current === requestActivation) {
        setSeeking(false);
        setDragPosition(null);
      }
    }
  }

  async function togglePlayback() {
    if (playDisabled) {
      return;
    }
    if (!requested.current) {
      startPlayback();
      return;
    }
    const requestActivation = activation.current;
    try {
      if (status.playing) {
        player.pause();
        return;
      }
      if (finished) {
        await player.seekTo(0);
      }
      if (!focused.current || activation.current !== requestActivation) {
        return;
      }
      if (Platform.OS !== 'web') {
        player.setActiveForLockScreen(true, { title, artist: tourTitle });
      }
      player.play();
    } catch {
      if (focused.current && activation.current === requestActivation) {
        setCommandError('Could not play this narration. Try loading the audio again.');
      }
    }
  }

  return (
    <View style={styles.player}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>LISTEN TO THIS CHAPTER</Text>
          <Text style={styles.caption}>Demo narration · Synthesized voice</Text>
        </View>
        {loading && !error && <ActivityIndicator accessibilityLabel="Loading narration" color={colors.green} />}
        {!hasRequested && ready && !error && <Text style={styles.state}>Ready to listen</Text>}
        {loaded && !error && <Text style={styles.state}>{status.isBuffering ? 'Buffering…' : status.playing ? 'Playing' : finished ? 'Finished' : 'Paused'}</Text>}
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back 15 seconds" disabled={disabled} onPress={() => { void seek(status.currentTime - 15); }} style={[styles.skipButton, disabled && styles.disabled]}>
          <Ionicons name="play-back-outline" size={22} color={colors.green} />
          <Text style={styles.skipText}>15s</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={hasRequested && status.playing ? 'Pause narration' : finished ? 'Replay narration' : 'Play narration'} disabled={playDisabled} onPress={() => { void togglePlayback(); }} style={[styles.playButton, playDisabled && styles.disabled]}>
          <Ionicons name={hasRequested && status.playing ? 'pause' : finished ? 'refresh' : 'play'} size={26} color={colors.surface} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Forward 15 seconds" disabled={disabled} onPress={() => { void seek(status.currentTime + 15); }} style={[styles.skipButton, disabled && styles.disabled]}>
          <Ionicons name="play-forward-outline" size={22} color={colors.green} />
          <Text style={styles.skipText}>15s</Text>
        </Pressable>
      </View>

      <SeekSlider
        valueText={`${formatTime(position)} of ${formatTime(duration)}`}
        maximumValue={duration || 1}
        value={position}
        disabled={disabled}
        onSlidingStart={(value) => { setDragPosition(value); }}
        onValueChange={(value) => { setDragPosition(value); }}
        onSlidingComplete={(value) => { void seek(value); }}
      />
      <View style={styles.times}>
        <Text accessibilityLabel={`Elapsed ${formatTime(position)}`} style={styles.time}>{formatTime(position)}</Text>
        <Text accessibilityLabel={loaded ? `Duration ${formatTime(duration)}` : 'Duration available after playback starts'} style={styles.time}>{loaded ? formatTime(duration) : '—:—'}</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text role="alert" style={styles.errorText}>{error}</Text>
          {!sessionError && (
            <Pressable accessibilityRole="button" onPress={startPlayback} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry audio</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  player: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 17, padding: 24, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  headingCopy: { flex: 1, gap: 7 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, color: colors.green },
  caption: { fontSize: 12, lineHeight: 19, color: colors.muted },
  state: { fontSize: 11, color: colors.muted },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, paddingVertical: 8 },
  playButton: { backgroundColor: colors.green, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  skipButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  skipText: { fontSize: 10, color: colors.muted },
  disabled: { opacity: 0.4 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 12, color: colors.muted, fontVariant: ['tabular-nums'] },
  errorBox: { gap: 10, marginTop: 8 },
  errorText: { color: '#9A442A', fontSize: 13, lineHeight: 21 },
  retryButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  retryText: { color: colors.green, fontWeight: '600', fontSize: 12 },
});
