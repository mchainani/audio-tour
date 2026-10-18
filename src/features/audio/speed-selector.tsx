import { useId } from 'react';

import { playbackRates, type SpeedSelectorProps } from './speed-selector.types';

import './speed-selector.css';

/** Native radio inputs provide Space, arrow keys, and a single tab stop per group. */
export function SpeedSelector({ rate, onChange }: SpeedSelectorProps) {
  const name = useId();
  return (
    <div className="speed-selector">
      <fieldset>
        <legend>Playback speed</legend>
        <div className="speed-selector-options">
          {playbackRates.map((value) => (
            <label key={value} className={rate === value ? 'speed-option selected' : 'speed-option'}>
              <input type="radio" name={name} aria-label={`${value}× speed`} value={value} checked={rate === value} onChange={() => onChange(value)} />
              <span>{value}×</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
