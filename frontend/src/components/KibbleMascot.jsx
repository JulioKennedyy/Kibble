import React, { useState, useEffect, useMemo } from "react";

/**
 * Kibble Mascot — Authentic Reference Visual System
 * 
 * Uses exact high-definition visual assets extracted from the reference images:
 * - Rounded particle/token body with glowing lavender spheres
 * - Pure 3D lighting, glossy bubbles and cute simple eyes
 * - Floating isometric token cubes
 * - Passive animations: float, breathing, munching, thinking, sleeping
 */

export const KIBBLE_ASSETS = {
  idle: "/kibble/idle_calm.png",
  eating: "/kibble/eating.png",
  eating_happy: "/kibble/eating_happy.png",
  satisfied: "/kibble/satisfied.png",
  thinking: "/kibble/thinking.png",
  sleeping: "/kibble/sleeping.png",
  surprised: "/kibble/surprised.png",
  scared: "/kibble/surprised.png",
  cube: "/kibble/token_cube.png",
};

export function KibbleMascot({
  state = "idle",
  size = 64,
  isTyping = false,
  isDeleting = false,
  className = "",
  showGlow = true,
  showShadow = true,
  interactive = true,
  speech = null,
  onClick = null,
}) {
  const [isWobbling, setIsWobbling] = useState(false);
  const [petHeart, setPetHeart] = useState(false);

  // Normalize effective state
  const activeState = useMemo(() => {
    if (isDeleting) return "deleting";
    if (isTyping) return "eating";
    if (state === "hungry") return "eating";
    if (state === "overloaded" || state === "scared") return "scared";
    if (state === "many_tokens") return "satisfied";
    return state || "idle";
  }, [state, isTyping, isDeleting]);

  const imageSrc =
    activeState === "deleting"
      ? KIBBLE_ASSETS.scared
      : KIBBLE_ASSETS[activeState] || KIBBLE_ASSETS.idle;

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    // Passive pet reaction
    setIsWobbling(true);
    setPetHeart(true);
    setTimeout(() => setIsWobbling(false), 600);
    setTimeout(() => setPetHeart(false), 1200);
  };

  const isAlertState = activeState === "scared" || activeState === "overloaded";

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Speech / Thought Bubble (Passive status indicator) */}
      {speech && (
        <div
          className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-lg backdrop-blur-md pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95 z-20 ${
            isAlertState
              ? "border-amber-500/50 bg-[#1f0d0d]/95 text-amber-200 shadow-amber-950/40"
              : isDeleting
              ? "border-pink-500/40 bg-[#1a0f1d]/95 text-pink-200 shadow-pink-950/40"
              : "border-purple-500/30 bg-[#0d121f]/90 text-purple-200 shadow-purple-950/40"
          }`}
        >
          {speech}
          <div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-r border-b ${
              isAlertState
                ? "border-amber-500/50 bg-[#1f0d0d]"
                : isDeleting
                ? "border-pink-500/40 bg-[#1a0f1d]"
                : "border-purple-500/30 bg-[#0d121f]"
            }`}
          />
        </div>
      )}

      {/* Pet Heart floating up on click */}
      {petHeart && (
        <span className="absolute -top-4 text-xs animate-ping pointer-events-none z-30">
          💜
        </span>
      )}

      {/* Floating Animated Mascot Wrapper */}
      <div
        className={`relative w-full h-full flex items-center justify-center transition-transform duration-300 ${
          activeState === "eating" ? "kibble-munching" : ""
        } ${activeState === "deleting" ? "kibble-shivering" : ""} ${
          activeState === "thinking" ? "kibble-thinking" : ""
        } ${isAlertState ? "kibble-panic" : ""} ${
          activeState === "sleeping" ? "kibble-sleeping" : "kibble-floating"
        } ${isWobbling ? "kibble-wobble" : ""} ${
          interactive ? "cursor-pointer hover:scale-105 active:scale-95" : ""
        }`}
        onClick={handleClick}
      >
        {/* Ambient Glow */}
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-500"
            style={{
              background: isAlertState
                ? "radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(245, 158, 11, 0.2) 70%, transparent 100%)"
                : activeState === "deleting"
                ? "radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(168, 85, 247, 0.15) 70%, transparent 100%)"
                : activeState === "satisfied"
                ? "radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, rgba(147, 51, 234, 0.15) 70%, transparent 100%)"
                : activeState === "eating"
                ? "radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(126, 34, 206, 0.1) 70%, transparent 100%)"
                : "radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Floating Token Cubes flying into mouth when eating */}
        {activeState === "eating" && (
          <>
            <img
              src="/kibble/token_cube.png"
              alt=""
              className="absolute -right-2 top-2 w-3.5 h-3.5 object-contain kibble-cube-fly-1 pointer-events-none opacity-80"
            />
            <img
              src="/kibble/token_cube.png"
              alt=""
              className="absolute -right-4 bottom-3 w-2.5 h-2.5 object-contain kibble-cube-fly-2 pointer-events-none opacity-60"
            />
          </>
        )}

        {/* Spitting out token cube when deleting */}
        {activeState === "deleting" && (
          <img
            src="/kibble/token_cube.png"
            alt=""
            className="absolute -right-1 top-2.5 w-3.5 h-3.5 object-contain kibble-cube-spit pointer-events-none opacity-90"
          />
        )}

        {/* Floating 'z z' particles when sleeping */}
        {activeState === "sleeping" && (
          <div className="absolute -top-1 -right-1 flex flex-col items-center pointer-events-none z-10">
            <span className="text-[10px] font-bold text-purple-300 kibble-z-1">z</span>
            <span className="text-[8px] font-semibold text-purple-400 kibble-z-2">z</span>
          </div>
        )}

        {/* The 3D Kibble Character Image */}
        <img
          src={imageSrc}
          alt={`Kibble (${activeState})`}
          className="relative max-w-full max-h-full object-contain filter drop-shadow-[0_4px_12px_rgba(147,51,234,0.35)] transition-all duration-300"
          draggable={false}
        />
      </div>

      {/* Dynamic Ground Shadow below Kibble */}
      {showShadow && activeState !== "sleeping" && (
        <div
          className="absolute -bottom-1.5 w-3/4 h-2 rounded-full pointer-events-none kibble-ground-shadow"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(147, 51, 234, 0.28) 0%, rgba(15, 23, 42, 0.6) 50%, transparent 80%)",
          }}
        />
      )}
    </div>
  );
}
