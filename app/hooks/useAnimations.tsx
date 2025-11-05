"use client";

import { useState, useCallback, useEffect } from "react";

export type AnimationType =
  | "three-miss"
  | "three-triple"
  | "hit-sequence"
  | "victory";

interface HitData {
  Type: number;
  Section: number;
}

interface Animation {
  type: AnimationType;
  duration?: number;
  data?: HitData[];
}

const HitSequenceAnimation = ({ hits }: { hits: HitData[] }) => {
  const [visibleHits, setVisibleHits] = useState<number>(1);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Show remaining symbols with delay
    for (let i = 1; i < hits.length; i++) {
      const timer = setTimeout(() => {
        setVisibleHits(i + 1);
      }, i * 1000); // 1000ms (1 sec), 2000ms (2 sec)

      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [hits]);

  const getSymbol = (type: number) => {
    if (type === 1) return "\\";
    if (type === 2) return "X";
    if (type === 3) return "⊗";
    return "?";
  };

  return (
    <div className="text-center">
      <div className="text-8xl font-bold text-white mb-4 flex justify-center gap-12 items-center min-h-[120px]">
        {hits.map((hit, index) => {
          const isVisible = index < visibleHits;
          return (
            <span
              key={index}
              style={{
                fontFamily: "monospace",
                textShadow: "0 0 20px rgba(139, 92, 246, 0.8)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? "scale(1) translateY(0)"
                  : "scale(0.5) translateY(-20px)",
                display: "inline-block",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                willChange: "transform, opacity",
              }}
            >
              {getSymbol(hit.Type)}
            </span>
          );
        })}
      </div>
      <div
        className="text-2xl text-purple-300 mt-2"
        style={{
          opacity: visibleHits === hits.length ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      ></div>
    </div>
  );
};

export function useAnimations() {
  const [currentAnimation, setCurrentAnimation] = useState<Animation | null>(
    null
  );
  const [animationKey, setAnimationKey] = useState<number>(0);

  const playAnimation = useCallback(
    (type: AnimationType, data?: HitData[], duration: number = 3000) => {
      setAnimationKey((prev) => prev + 1);
      setCurrentAnimation({ type, data, duration });
      setTimeout(() => {
        setCurrentAnimation(null);
      }, duration);
    },
    []
  );

  const AnimationOverlay = useCallback(() => {
    if (!currentAnimation) return null;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div
          className={
            currentAnimation.type === "hit-sequence" ? "" : "animate-bounce-in"
          }
        >
          {currentAnimation.type === "hit-sequence" &&
            currentAnimation.data && (
              <HitSequenceAnimation
                key={animationKey}
                hits={currentAnimation.data}
              />
            )}
          {currentAnimation.type === "three-miss" && (
            <div className="text-center">
              <div className="text-9xl mb-4 animate-shake">🐐</div>
              <div className="text-4xl font-bold text-white animate-pulse">
                BÊÊÊÊÊ!
              </div>
            </div>
          )}
          {currentAnimation.type === "three-triple" && (
            <div className="text-center">
              <div className="text-9xl mb-4 animate-rainbow">🦄</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                LICORNE!
              </div>
              <div className="text-2xl text-purple-300 mt-2">
                3 Triples! Magique!
              </div>
            </div>
          )}
          {currentAnimation.type === "victory" && (
            <div className="text-center">
              <div className="text-9xl mb-4 animate-trophy">🏆</div>
              <div className="text-4xl font-bold text-yellow-400 animate-pulse">
                VICTOIRE!
              </div>
              <div className="text-2xl text-purple-300 mt-2">
                Félicitations!
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes bounce-in {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            10%,
            30%,
            50%,
            70%,
            90% {
              transform: translateX(-10px);
            }
            20%,
            40%,
            60%,
            80% {
              transform: translateX(10px);
            }
          }

          @keyframes trophy {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes rainbow {
            0% {
              filter: hue-rotate(0deg) brightness(1.2);
              transform: scale(1);
            }
            25% {
              filter: hue-rotate(90deg) brightness(1.5);
              transform: scale(1.1);
            }
            50% {
              filter: hue-rotate(180deg) brightness(1.2);
              transform: scale(1);
            }
            75% {
              filter: hue-rotate(270deg) brightness(1.5);
              transform: scale(1.1);
            }
            100% {
              filter: hue-rotate(360deg) brightness(1.2);
              transform: scale(1);
            }
          }

          .animate-bounce-in {
            animation: bounce-in 0.5s ease-out;
          }

          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }

          .animate-trophy {
            animation: trophy 1s ease-in-out infinite;
          }

          .animate-rainbow {
            animation: rainbow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }, [currentAnimation, animationKey]);

  return {
    playAnimation,
    AnimationOverlay,
    currentAnimation,
  };
}
