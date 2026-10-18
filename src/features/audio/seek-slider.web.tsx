import { useRef } from 'react';

import { colors } from '@/theme';

import type { SeekSliderProps } from './seek-slider.types';

/** A native range input keeps browser seeking accessible to keyboard users. */
export function SeekSlider({ value, maximumValue, disabled, valueText, onSlidingStart, onValueChange, onSlidingComplete }: SeekSliderProps) {
  const pendingValue = useRef<number | null>(null);

  function preview(nextValue: number) {
    if (pendingValue.current === null) {
      onSlidingStart(nextValue);
    }
    pendingValue.current = nextValue;
    onValueChange(nextValue);
  }

  function commit() {
    if (pendingValue.current !== null) {
      const nextValue = pendingValue.current;
      pendingValue.current = null;
      onSlidingComplete(nextValue);
    }
  }

  return (
    <input
      type="range"
      aria-label="Narration position"
      aria-valuetext={valueText}
      min={0}
      max={maximumValue}
      step="any"
      value={value}
      disabled={disabled}
      onChange={(event) => { preview(event.currentTarget.valueAsNumber); }}
      onKeyDown={(event) => {
        const currentValue = pendingValue.current ?? value;
        let nextValue: number;
        switch (event.key) {
          case 'ArrowRight': case 'ArrowUp': nextValue = currentValue + 1; break;
          case 'ArrowLeft': case 'ArrowDown': nextValue = currentValue - 1; break;
          case 'PageUp': nextValue = currentValue + 10; break;
          case 'PageDown': nextValue = currentValue - 10; break;
          case 'Home': nextValue = 0; break;
          case 'End': nextValue = maximumValue; break;
          default: return;
        }
        event.preventDefault();
        preview(Math.min(maximumValue, Math.max(0, nextValue)));
      }}
      onPointerUp={commit}
      onPointerCancel={commit}
      onKeyUp={commit}
      onBlur={commit}
      style={{ width: '100%', height: 32, margin: 0, accentColor: colors.green, cursor: disabled ? 'default' : 'pointer' }}
    />
  );
}
