import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface AudioSession {
  readonly player: ReturnType<typeof useAudioPlayer>;
  readonly ready: boolean;
  readonly error: string | null;
}

const AudioSessionContext = createContext<AudioSession | null>(null);

/** One player owns playback across all chapter screens in the navigation stack. */
export function AudioSessionProvider({ children }: PropsWithChildren) {
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const [ready, setReady] = useState(Platform.OS === 'web');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    let active = true;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      allowsRecording: false,
    }).then(() => {
      if (active) {
        setReady(true);
      }
    }).catch(() => {
      if (active) {
        setError('The device audio session could not start. Please reopen the app.');
      }
    });
    return () => { active = false; };
  }, []);

  return (
    <AudioSessionContext.Provider value={{ player, ready, error }}>
      {children}
    </AudioSessionContext.Provider>
  );
}

export function useAudioSession() {
  const session = useContext(AudioSessionContext);
  if (!session) {
    throw new Error('Chapter audio requires AudioSessionProvider.');
  }
  return session;
}
