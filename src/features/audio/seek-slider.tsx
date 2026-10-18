import Slider from '@react-native-community/slider';

import { colors } from '@/theme';

import type { SeekSliderProps } from './seek-slider.types';

export function SeekSlider({ valueText, ...props }: SeekSliderProps) {
  return (
    <Slider
      {...props}
      accessibilityLabel="Narration position"
      accessibilityValue={{ min: 0, max: props.maximumValue, now: props.value, text: valueText }}
      minimumValue={0}
      minimumTrackTintColor={colors.green}
      maximumTrackTintColor={colors.border}
      thumbTintColor={colors.green}
      tapToSeek
      style={{ width: '100%', height: 32 }}
    />
  );
}
