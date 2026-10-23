interface AudioUnavailableProps {
  readonly onRetry?: () => void;
}

export function AudioUnavailable({ onRetry }: AudioUnavailableProps) {
  return <section className="player" aria-label="Chapter narration">
    <p className="player-eyebrow">LISTEN TO THIS CHAPTER</p>
    <p className="muted" role="status">Audio not available.</p>
    {onRetry && <button className="button" onClick={onRetry}>Retry audio</button>}
  </section>;
}
