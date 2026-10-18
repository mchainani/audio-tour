interface SeekSliderProps {
  readonly value: number;
  readonly maximumValue: number;
  readonly disabled: boolean;
  readonly valueText: string;
  readonly onSeek: (value: number) => void;
}

/** A browser range input with explicit, predictable seek increments. */
export function SeekSlider({ value, maximumValue, disabled, valueText, onSeek }: SeekSliderProps) {
  return <input type="range" className="seek-slider" aria-label="Narration position" aria-valuetext={valueText} min={0} max={maximumValue} step="any" value={value} disabled={disabled}
    onChange={(event) => onSeek(event.currentTarget.valueAsNumber)}
    onKeyDown={(event) => {
      let next: number;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowUp': next = value + 1; break;
        case 'ArrowLeft': case 'ArrowDown': next = value - 1; break;
        case 'PageUp': next = value + 10; break;
        case 'PageDown': next = value - 10; break;
        case 'Home': next = 0; break;
        case 'End': next = maximumValue; break;
        default: return;
      }
      event.preventDefault();
      onSeek(Math.max(0, Math.min(maximumValue, next)));
    }} />;
}
