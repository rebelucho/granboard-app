import { useEffect, useRef } from "react";
import { useSettings } from "@/app/contexts/SettingsContext";

type SoundType =
  | "dart-hit"
  | "dart-miss"
  | "number-closed"
  | "all-closed"
  | "player-change"
  | "game-over"
  | "triple"
  | "bull";

export function useSounds() {
  const { volume, soundEnabled } = useSettings();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener("click", initAudio, { once: true });
    return () => document.removeEventListener("click", initAudio);
  }, []);

  const playBeep = (frequency: number, duration: number, baseVolume: number = 0.3) => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Appliquer le volume global
    const adjustedVolume = baseVolume * volume;
    gainNode.gain.setValueAtTime(adjustedVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playChord = (frequencies: number[], duration: number, baseVolume: number = 0.2) => {
    if (!soundEnabled || !audioContextRef.current) return;

    frequencies.forEach((freq) => {
      playBeep(freq, duration, baseVolume / frequencies.length);
    });
  };

  const playSound = (type: SoundType) => {
    if (!soundEnabled) return;

    switch (type) {
      case "dart-hit":
        // Son simple pour une fléchette
        playBeep(800, 0.05, 0.2);
        break;

      case "dart-miss":
        // Son grave pour un miss
        playBeep(200, 0.1, 0.15);
        break;

      case "triple":
        // Triple son ascendant
        setTimeout(() => playBeep(600, 0.08, 0.25), 0);
        setTimeout(() => playBeep(800, 0.08, 0.25), 50);
        setTimeout(() => playBeep(1000, 0.08, 0.25), 100);
        break;

      case "bull":
        // Bullseye - son spécial
        setTimeout(() => playBeep(1200, 0.1, 0.3), 0);
        setTimeout(() => playBeep(1400, 0.15, 0.3), 80);
        break;

      case "number-closed":
        // Numéro fermé - accord
        playChord([523, 659, 784], 0.2, 0.25);
        break;

      case "all-closed":
        // Tous les joueurs ont fermé - accord majeur
        playChord([523, 659, 784, 1047], 0.3, 0.3);
        break;

      case "player-change":
        // Changement de joueur - 2 notes
        setTimeout(() => playBeep(500, 0.1, 0.2), 0);
        setTimeout(() => playBeep(700, 0.1, 0.2), 100);
        break;

      case "game-over":
        // Fin de partie - mélodie de victoire
        setTimeout(() => playBeep(523, 0.15, 0.3), 0);
        setTimeout(() => playBeep(659, 0.15, 0.3), 150);
        setTimeout(() => playBeep(784, 0.15, 0.3), 300);
        setTimeout(() => playBeep(1047, 0.4, 0.3), 450);
        break;
    }
  };

  return {
    playSound,
  };
}
