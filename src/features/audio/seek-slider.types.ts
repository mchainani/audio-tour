export interface SeekSliderProps {
  readonly value: number;
  readonly maximumValue: number;
  readonly disabled: boolean;
  readonly valueText: string;
  readonly onSlidingStart: (value: number) => void;
  readonly onValueChange: (value: number) => void;
  readonly onSlidingComplete: (value: number) => void;
}
