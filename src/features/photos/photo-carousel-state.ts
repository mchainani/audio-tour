interface PhotoCarouselState {
  readonly images: readonly string[];
  readonly selected: number;
}

type PhotoCarouselAction = { readonly type: 'move'; readonly direction: number }
  | { readonly type: 'failed'; readonly src: string };

export function photoCarouselReducer(state: PhotoCarouselState, action: PhotoCarouselAction): PhotoCarouselState {
  if (action.type === 'move') {
    return state.images.length === 0 ? state
      : { ...state, selected: (state.selected + action.direction + state.images.length) % state.images.length };
  }
  const images = state.images.filter((src) => src !== action.src);
  const removedBefore = state.images.slice(0, state.selected).filter((src) => src === action.src).length;
  const selected = images.length === 0 ? 0 : (state.selected - removedBefore) % images.length;
  return { images, selected };
}
