"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useAnimations } from "@/app/hooks/useAnimations";

type AnimationType =
  | "three-miss"
  | "three-triple"
  | "hit-sequence"
  | "victory";

interface HitData {
  Type: number;
  Section: number;
}

interface AnimationInfo {
  id: AnimationType;
  name: string;
  description: string;
  emoji: string;
  data?: HitData[];
}

const animationsList: AnimationInfo[] = [
  {
    id: "three-miss",
    name: "3 Miss - Chèvre",
    description: "Animation quand le joueur fait 3 miss (la chèvre)",
    emoji: "🐐",
  },
  {
    id: "three-triple",
    name: "3 Triples - Licorne",
    description: "Animation quand le joueur fait 3 triples (magique!)",
    emoji: "🦄",
  },
  {
    id: "hit-sequence",
    name: "Séquence 3 Simples",
    description: "Animation pour 3 simples: \\ \\ \\",
    emoji: "🎯",
    data: [
      { Type: 1, Section: 20 },
      { Type: 1, Section: 20 },
      { Type: 1, Section: 20 },
    ],
  },
  {
    id: "hit-sequence",
    name: "Séquence Simple-Double-Triple",
    description: "Animation pour simple, double, triple: \\ X ⊗",
    emoji: "🎯",
    data: [
      { Type: 1, Section: 20 },
      { Type: 2, Section: 20 },
      { Type: 3, Section: 20 },
    ],
  },
  {
    id: "hit-sequence",
    name: "Séquence 3 Doubles",
    description: "Animation pour 3 doubles: X X X",
    emoji: "🎯",
    data: [
      { Type: 2, Section: 20 },
      { Type: 2, Section: 20 },
      { Type: 2, Section: 20 },
    ],
  },
  {
    id: "victory",
    name: "Victoire",
    description: "Animation de victoire",
    emoji: "🏆",
  },
];

export default function AnimationsDebugPage() {
  const router = useRouter();
  const [playing, setPlaying] = useState<number | null>(null);
  const { playAnimation: triggerAnimation, AnimationOverlay } = useAnimations();

  const playAnimation = (animation: AnimationInfo, index: number) => {
    setPlaying(index);
    const duration = animation.id === "hit-sequence" ? 3500 : 3000;
    triggerAnimation(animation.id, animation.data, duration);
    setTimeout(() => setPlaying(null), duration);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Animation Overlay */}
      <AnimationOverlay />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Retour
          </button>
          <h1 className="text-5xl font-bold text-white mb-2">
            🎬 Debug Animations
          </h1>
          <p className="text-purple-200">
            Testez toutes les animations de l&apos;application
          </p>
        </div>

        {/* Animations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animationsList.map((animation, index) => (
            <button
              key={index}
              onClick={() => playAnimation(animation, index)}
              className={`group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 transition-all text-left ${
                playing === index ? "ring-4 ring-purple-400 scale-105" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <span className="text-6xl">{animation.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {animation.name}
                    </h3>
                    <p className="text-purple-200 text-sm mt-1">
                      {animation.description}
                    </p>
                  </div>
                </div>
                {playing === index && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500 text-white text-sm rounded-full animate-pulse">
                    ▶ Playing
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-purple-300 text-sm">
          <p>💡 Cliquez sur une animation pour la visualiser en plein écran</p>
        </div>
      </div>
    </main>
  );
}
