import { createContext, type PropsWithChildren, useContext, useEffect, useState, useSyncExternalStore } from 'react';

import { AudioPlayback } from './audio-playback';

const AudioSessionContext = createContext<AudioPlayback | null>(null);

export function AudioSessionProvider({ children }: PropsWithChildren) {
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
