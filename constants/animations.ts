/**
 * Animation timing constants (in milliseconds)
 */
export const ANIMATION_TIMINGS = {
  /** Delay before showing turn animations after hit animation */
  HIT_ANIMATION_DELAY: 1000,

  /** Duration for hit-sequence animation */
  HIT_SEQUENCE_DURATION: 3500,

  /** Default animation duration */
  DEFAULT_DURATION: 3000,

  /** Delay between whistle sounds */
  WHISTLE_DELAY: 600,

  /** Delay for state checks after hit */
  STATE_CHECK_DELAY: 100,
} as const;
