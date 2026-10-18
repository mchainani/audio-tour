export interface SpeedSelectorProps {
  readonly rate: number;
  readonly onChange: (rate: number) => void;
}

export const playbackRates = [0.75, 1, 1.25, 1.5, 2] as const;
