import { useEffect, useRef } from "react";
import { useSettings } from "@/app/contexts/SettingsContext";
import { SOUND_PATHS } from "@/constants/sounds";
import { ANIMATION_TIMINGS } from "@/constants/animations";

type SoundType =
  | "dart-miss"
  | "game-over"
  | "bull"
  | "double-bull"
  | "victory"
  | "whistle-single"
  | "whistle-double"
  | "whistle-triple"
  | "goat"
  | "horse";

// Sound registry for managing audio elements
type SoundRegistry = {
  [K in SoundType]?: HTMLAudioElement;
};

export function useSounds() {
  const { volume, soundEnabled } = useSettings();
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundRegistry = useRef<SoundRegistry>({});

  // Helper to get or create audio element
  const getOrCreateAudio = (type: SoundType, path: string): HTMLAudioElement => {
    if (!soundRegistry.current[type]) {
      const audio = new Audio(path);
      audio.preload = "auto";
      soundRegistry.current[type] = audio;
    }
    return soundRegistry.current[type]!;
  };

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener("click", initAudio, { once: true });
    return () => document.removeEventListener("click", initAudio);
  }, []);

  const playBeep = (
    frequency: number,
    duration: number,
    baseVolume: number = 0.3,
    waveType: OscillatorType = "sine"
  ) => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Chaîne audio avec filtre pour un son plus doux
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = waveType;

    // Filtre passe-bas pour adoucir le son
    filter.type = "lowpass";
    filter.frequency.value = frequency * 2;
    filter.Q.value = 1;

    // Appliquer le volume global avec enveloppe ADSR
    const adjustedVolume = baseVolume * volume;
    const now = ctx.currentTime;

    // Attack (montée rapide)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(adjustedVolume, now + 0.01);

    // Decay & Sustain
    gainNode.gain.linearRampToValueAtTime(adjustedVolume * 0.7, now + 0.05);

    // Release (descente douce)
    gainNode.gain.setValueAtTime(adjustedVolume * 0.7, now + duration - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  const playChord = (
    frequencies: number[],
    duration: number,
    baseVolume: number = 0.2
  ) => {
    if (!soundEnabled || !audioContextRef.current) return;

    frequencies.forEach((freq) => {
      playBeep(freq, duration, baseVolume / frequencies.length);
    });
  };

  // Play whistle sound (creates new instance each time for overlapping sounds)
  const playSifflet = () => {
    if (!soundEnabled) return;

    const audio = new Audio(SOUND_PATHS.SIFFLET);
    audio.volume = volume;
    audio.play().catch(() => {
      // Ignore errors if audio can't play
    });
  };

  const playSound = (type: SoundType) => {
    if (!soundEnabled) return;

    // Handle special whistle cases (multiple sounds)
    if (type === "whistle-single") {
      playSifflet();
      return;
    }

    if (type === "whistle-double") {
      playSifflet();
      setTimeout(() => playSifflet(), ANIMATION_TIMINGS.WHISTLE_DELAY);
      return;
    }

    if (type === "whistle-triple") {
      playSifflet();
      setTimeout(() => playSifflet(), ANIMATION_TIMINGS.WHISTLE_DELAY);
      setTimeout(() => playSifflet(), ANIMATION_TIMINGS.WHISTLE_DELAY * 2);
      return;
    }

    // Map sound types to their file paths
    const soundPathMap: Record<string, string> = {
      "dart-miss": SOUND_PATHS.DART_MISS,
      "bull": SOUND_PATHS.BULL,
      "double-bull": SOUND_PATHS.DOUBLE_BULL,
      "game-over": SOUND_PATHS.GAME_OVER,
      "victory": SOUND_PATHS.VICTORY,
      "goat": SOUND_PATHS.GOAT,
      "horse": SOUND_PATHS.HORSE,
    };

    const soundPath = soundPathMap[type];
    if (!soundPath) return;

    // Get or create audio element and play
    const audio = getOrCreateAudio(type, soundPath);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore errors if audio can't play
    });
  };

  return {
    playSound,
  };
}
