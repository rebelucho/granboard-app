import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnimations } from './useAnimations';

describe('useAnimations', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with no animation', () => {
    const { result } = renderHook(() => useAnimations());
    expect(result.current.currentAnimation).toBeNull();
  });

  it('should play three-miss animation', () => {
    const { result } = renderHook(() => useAnimations());

    act(() => {
      result.current.playAnimation('three-miss');
    });

    expect(result.current.currentAnimation).toEqual({
      type: 'three-miss',
      duration: 3000,
      data: undefined,
    });
  });

  it('should play three-triple animation', () => {
    const { result } = renderHook(() => useAnimations());

    act(() => {
      result.current.playAnimation('three-triple');
    });

    expect(result.current.currentAnimation).toEqual({
      type: 'three-triple',
      duration: 3000,
      data: undefined,
    });
  });

  it('should play hit-sequence animation with data', () => {
    const { result } = renderHook(() => useAnimations());
    const hitData = [
      { Type: 1, Section: 20 },
      { Type: 2, Section: 20 },
      { Type: 3, Section: 20 },
    ];

    act(() => {
      result.current.playAnimation('hit-sequence', hitData, 3500);
    });

    expect(result.current.currentAnimation).toEqual({
      type: 'hit-sequence',
      duration: 3500,
      data: hitData,
    });
  });

  it('should play victory animation', () => {
    const { result } = renderHook(() => useAnimations());

    act(() => {
      result.current.playAnimation('victory');
    });

    expect(result.current.currentAnimation).toEqual({
      type: 'victory',
      duration: 3000,
      data: undefined,
    });
  });

  it('should clear animation after duration', async () => {
    const { result } = renderHook(() => useAnimations());

    act(() => {
      result.current.playAnimation('three-miss', undefined, 1000);
    });

    expect(result.current.currentAnimation).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.currentAnimation).toBeNull();
    });
  });

  it('should use default duration of 3000ms when not specified', async () => {
    const { result } = renderHook(() => useAnimations());

    act(() => {
      result.current.playAnimation('three-triple');
    });

    expect(result.current.currentAnimation).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(2999);
    });

    // Still visible
    expect(result.current.currentAnimation).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    await waitFor(() => {
      expect(result.current.currentAnimation).toBeNull();
    });
  });

  it('should increment animation key on each play', async () => {
    const { result } = renderHook(() => useAnimations());

    act(() => {
      result.current.playAnimation('three-miss');
    });

    const firstAnimationType = result.current.currentAnimation?.type;

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Wait for state update
    await waitFor(() => {
      expect(result.current.currentAnimation).toBeNull();
    });

    act(() => {
      result.current.playAnimation('three-triple');
    });

    // Animation type should be different
    expect(result.current.currentAnimation?.type).not.toBe(firstAnimationType);
    expect(result.current.currentAnimation?.type).toBe('three-triple');
  });

  it('should handle custom duration for hit-sequence', async () => {
    const { result } = renderHook(() => useAnimations());
    const hitData = [
      { Type: 1, Section: 15 },
      { Type: 1, Section: 16 },
      { Type: 1, Section: 17 },
    ];

    act(() => {
      result.current.playAnimation('hit-sequence', hitData, 3500);
    });

    expect(result.current.currentAnimation?.duration).toBe(3500);

    act(() => {
      jest.advanceTimersByTime(3499);
    });

    expect(result.current.currentAnimation).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    await waitFor(() => {
      expect(result.current.currentAnimation).toBeNull();
    });
  });
});
