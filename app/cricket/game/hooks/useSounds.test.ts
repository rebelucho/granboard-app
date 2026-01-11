import { renderHook, act } from '@testing-library/react';
import { useSounds } from './useSounds';
import * as SettingsContext from '@/app/contexts/SettingsContext';

// Mock HTMLAudioElement
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockAudio = {
  play: mockPlay,
  pause: jest.fn(),
  volume: 1,
  currentTime: 0,
  preload: 'auto',
};

global.Audio = jest.fn().mockImplementation(() => mockAudio) as any;

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    frequency: { value: 0 },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  }),
  createBiquadFilter: jest.fn().mockReturnValue({
    connect: jest.fn(),
    type: 'lowpass',
    frequency: { value: 0 },
    Q: { value: 0 },
  }),
  destination: {},
  currentTime: 0,
})) as any;

// Mock SettingsContext
jest.mock('@/app/contexts/SettingsContext', () => ({
  useSettings: jest.fn(),
}));

describe('useSounds', () => {
  const mockUseSettings = SettingsContext.useSettings as jest.MockedFunction<typeof SettingsContext.useSettings>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSettings.mockReturnValue({
      volume: 0.5,
      soundEnabled: true,
      setVolume: jest.fn(),
      toggleSound: jest.fn(),
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark',
      isDialogOpen: false,
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
      customContent: undefined,
    });
  });

  it('should initialize and preload audio files on first click', () => {
    const { result } = renderHook(() => useSounds());

    expect(result.current.playSound).toBeDefined();
  });

  it('should not play sound when soundEnabled is false', () => {
    mockUseSettings.mockReturnValue({
      volume: 0.5,
      soundEnabled: false,
      setVolume: jest.fn(),
      toggleSound: jest.fn(),
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark',
      isDialogOpen: false,
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
      customContent: undefined,
    });

    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('dart-miss');
    });

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should play dart-miss sound', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('dart-miss');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play bull sound', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('bull');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play double-bull sound', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('double-bull');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play goat sound', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('goat');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play horse sound', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('horse');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play victory sound', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('victory');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play game-over sound', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('game-over');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should set correct volume', () => {
    mockUseSettings.mockReturnValue({
      volume: 0.7,
      soundEnabled: true,
      setVolume: jest.fn(),
      toggleSound: jest.fn(),
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark',
      isDialogOpen: false,
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
      customContent: undefined,
    });

    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('dart-miss');
    });

    expect(mockAudio.volume).toBe(0.7);
  });

  it('should reset currentTime to 0 before playing', () => {
    const { result } = renderHook(() => useSounds());

    mockAudio.currentTime = 5;

    act(() => {
      result.current.playSound('bull');
    });

    expect(mockAudio.currentTime).toBe(0);
  });

  it('should handle audio play errors gracefully', () => {
    mockPlay.mockRejectedValueOnce(new Error('Play failed'));

    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('dart-miss');
    });

    // Should not throw
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play whistle-single', () => {
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('whistle-single');
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should play whistle-double (2 times)', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('whistle-double');
    });

    // First whistle
    expect(mockPlay).toHaveBeenCalledTimes(1);

    // Wait for second whistle (600ms)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(mockPlay).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should play whistle-triple (3 times)', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSounds());

    act(() => {
      result.current.playSound('whistle-triple');
    });

    // First whistle
    expect(mockPlay).toHaveBeenCalledTimes(1);

    // Wait for second whistle (600ms)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(mockPlay).toHaveBeenCalledTimes(2);

    // Wait for third whistle (600ms more = 1200ms total)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(mockPlay).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  });
});
