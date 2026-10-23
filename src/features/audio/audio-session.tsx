import { createContext, type ReactNode, useContext, useEffect, useState, useSyncExternalStore } from 'react';

import { AudioPlayback } from './audio-playback';

interface AudioSessionProviderProps {
  children?: ReactNode;
}

const AudioSessionContext = createContext<AudioPlayback | null>(null);

export function AudioSessionProvider({ children }: AudioSessionProviderProps) {
  const [player] = useState(() => new AudioPlayback());
  useEffect(() => () => player.reset(), [player]);
  return <AudioSessionContext.Provider value={player}>{children}</AudioSessionContext.Provider>;
}

export function useAudioSession() {
  const player = useContext(AudioSessionContext);
  if (!player) throw new Error('Chapter audio requires AudioSessionProvider.');
  const state = useSyncExternalStore(player.subscribe, player.getSnapshot);
  return { player, state };
}
