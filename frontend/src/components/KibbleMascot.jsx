import React, { useEffect, useId, useMemo, useRef, useState } from "react";

const STATE_ALIASES = {
  hungry: "eating",
  found_token: "idle",
  searching: "thinking",
  no_tokens: "scared",
  many_tokens: "satisfied",
  fast_eating: "eating",
  celebrating: "satisfied",
  cursor_tracking: "idle",
  overloaded: "scared",
};

function OpenEyes({ gazeLeft = false, wide = false }) {
  const eyeRx = wide ? 3.8 : 3.25;
  const eyeRy = wide ? 4.7 : 4.15;

  return (
    <g
      data-gaze={gazeLeft ? "left" : "center"}
      style={{ transition: "transform 240ms ease" }}
      transform={gazeLeft ? "translate(-2.2 0)" : undefined}
    >
      <ellipse cx="27" cy="29.5" rx={eyeRx} ry={eyeRy} fill="#160b2b" />
      <ellipse cx="40" cy="28.5" rx={eyeRx} ry={eyeRy} fill="#160b2b" />
      <circle cx="26" cy="27.9" r="1.05" fill="#fff" />
      <circle cx="39" cy="26.9" r="1.05" fill="#fff" />
      <circle cx="27.8" cy="30.8" r=".45" fill="#c4b5fd" opacity=".8" />
      <circle cx="40.8" cy="29.8" r=".45" fill="#c4b5fd" opacity=".8" />
    </g>
  );
}

function Face({ state, gazeLeft = false }) {
  if (state === "sleeping") {
    return (
      <>
        <path d="M23 30c2.5 2 5 2 7.5 0" fill="none" stroke="#160b2b" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M36 29c2.5 2 5 2 7.5 0" fill="none" stroke="#160b2b" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M29 38c1.5-1.5 3-1.5 4.5 0 1.5-1.5 3-1.5 4.5 0" fill="none" stroke="#160b2b" strokeWidth="1.8" strokeLinecap="round" />
      </>
    );
  }

  if (state === "satisfied") {
    return (
      <>
        <path d="M23 30c2.5-3 5-3 7.5 0" fill="none" stroke="#160b2b" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M36 29c2.5-3 5-3 7.5 0" fill="none" stroke="#160b2b" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M29 35c3 4 6 4 9 0Z" fill="#160b2b" />
        <rect x="25" y="42" width="5" height="5" rx="1.4" fill="#ede9fe" opacity=".9" />
        <rect x="32" y="43" width="5" height="5" rx="1.4" fill="#c4b5fd" opacity=".9" />
        <rect x="39" y="41" width="5" height="5" rx="1.4" fill="#a78bfa" opacity=".9" />
      </>
    );
  }

  if (state === "scared" || state === "deleting" || state === "surprised") {
    return (
      <>
        <OpenEyes wide />
        <ellipse cx="34" cy="38" rx="3" ry="3.5" fill="#160b2b" />
      </>
    );
  }

  if (state === "thinking") {
    return (
      <>
        <OpenEyes gazeLeft />
        <path d="M31 38c2-1 4-1 6 0" fill="none" stroke="#160b2b" strokeWidth="2" strokeLinecap="round" />
        <text x="50" y="17" fill="#ede9fe" fontSize="13" fontWeight="800" fontFamily="system-ui">?</text>
      </>
    );
  }

  if (state === "eating") {
    return (
      <>
        <OpenEyes gazeLeft={gazeLeft} />
        <ellipse cx="38" cy="37" rx="3.3" ry="3.7" fill="#160b2b" />
      </>
    );
  }

  return (
    <>
      <OpenEyes gazeLeft={gazeLeft} />
      <path d="M30 37c3 3 6 3 9-.5" fill="none" stroke="#160b2b" strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

export function KibbleMascot({
  state = "idle",
  size = 64,
  isTyping = false,
  isDeleting = false,
  lookAtPrompt = false,
  className = "",
  showGlow = true,
  showShadow = true,
  interactive = true,
  speech = null,
  onClick = null,
}) {
  const [isWobbling, setIsWobbling] = useState(false);
  const [petHeart, setPetHeart] = useState(false);
  const [isGlancing, setIsGlancing] = useState(false);
  const wobbleTimer = useRef(null);
  const heartTimer = useRef(null);
  const glanceTimer = useRef(null);
  const glanceResetTimer = useRef(null);
  const id = useId().replaceAll(":", "");
  const bodyGradient = `kibble-body-${id}`;

  const activeState = useMemo(() => {
    if (isDeleting) return "deleting";
    if (isTyping) return "eating";
    return STATE_ALIASES[state] || state || "idle";
  }, [state, isTyping, isDeleting]);

  useEffect(
    () => () => {
      window.clearTimeout(wobbleTimer.current);
      window.clearTimeout(heartTimer.current);
      window.clearTimeout(glanceTimer.current);
      window.clearTimeout(glanceResetTimer.current);
    },
    [],
  );

  useEffect(() => {
    window.clearTimeout(glanceTimer.current);
    window.clearTimeout(glanceResetTimer.current);

    if (isTyping) {
      setIsGlancing(false);
      return undefined;
    }

    const scheduleGlance = () => {
      glanceTimer.current = window.setTimeout(() => {
        setIsGlancing(true);
        glanceResetTimer.current = window.setTimeout(() => {
          setIsGlancing(false);
          scheduleGlance();
        }, 1500);
      }, 6000);
    };

    scheduleGlance();
    return () => {
      window.clearTimeout(glanceTimer.current);
      window.clearTimeout(glanceResetTimer.current);
    };
  }, [isTyping]);

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    window.clearTimeout(wobbleTimer.current);
    window.clearTimeout(heartTimer.current);
    setIsWobbling(true);
    setPetHeart(true);
    wobbleTimer.current = window.setTimeout(() => setIsWobbling(false), 600);
    heartTimer.current = window.setTimeout(() => setPetHeart(false), 1200);
  };

  const isAlertState = activeState === "scared" || activeState === "deleting" || activeState === "surprised";

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`} style={{ width: size, height: size }}>
      {speech && (
        <div className={`absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-lg backdrop-blur-md ${isAlertState ? "border-amber-500/50 bg-[#1f0d0d]/95 text-amber-200" : "border-violet-500/30 bg-[#0d121f]/90 text-violet-200"}`}>
          {speech}
        </div>
      )}

      {petHeart && <span className="absolute -top-4 z-30 animate-ping text-xs text-violet-300">♥</span>}

      <div
        className={`relative flex h-full w-full items-center justify-center transition-transform duration-300 ${activeState === "eating" ? "kibble-munching" : ""} ${activeState === "deleting" ? "kibble-shivering" : ""} ${activeState === "thinking" ? "kibble-thinking" : ""} ${isAlertState ? "kibble-panic" : ""} ${activeState === "sleeping" ? "kibble-sleeping" : "kibble-floating"} ${isWobbling ? "kibble-wobble" : ""} ${interactive ? "cursor-pointer hover:scale-105 active:scale-95" : ""}`}
        onClick={handleClick}
      >
        {showGlow && <div className={`absolute inset-[8%] rounded-full blur-xl ${isAlertState ? "bg-amber-500/20" : "bg-violet-500/20"}`} />}

        {activeState === "eating" && (
          <>
            <span className="kibble-token-chip kibble-token-main kibble-token-to-mouth absolute right-0 top-[47%]" />
            <span className="kibble-token-chip kibble-token-small kibble-cube-fly-2 absolute -right-1 top-[32%] opacity-60" />
          </>
        )}

        {activeState === "deleting" && <span className="kibble-token-chip kibble-token-main kibble-cube-spit absolute -right-1 top-[38%]" />}

        {activeState === "sleeping" && (
          <div className="absolute -right-1 -top-1 z-10 flex flex-col text-violet-300">
            <span className="kibble-z-1 text-[11px] font-bold">z</span>
            <span className="kibble-z-2 text-[9px] font-semibold">z</span>
          </div>
        )}

        <svg
          aria-label={`Kibble (${activeState})`}
          className={`relative h-full w-full overflow-visible drop-shadow-[0_8px_18px_rgba(139,92,246,0.32)] ${isAlertState ? "kibble-svg-alert" : ""}`}
          role="img"
          viewBox="0 0 64 64"
        >
          <defs>
            <radialGradient id={bodyGradient} cx="38%" cy="28%" r="72%">
              <stop offset="0" stopColor="#f4f2ff" />
              <stop offset=".34" stopColor="#c4b5fd" />
              <stop offset=".72" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#5b21b6" />
            </radialGradient>
          </defs>

          <circle cx="29" cy="9" r="4" fill="#ddd6fe" />
          <circle cx="25" cy="5.5" r="3" fill="#a78bfa" />
          <circle cx="21.5" cy="7.5" r="2.2" fill="#7c3aed" />
          <path d="M13 27C15 16 25 12 35 13c11 1 18 8 18 19 0 13-9 22-23 22S9 45 11 34c.4-3 1-5 2-7Z" fill={`url(#${bodyGradient})`} />

          <circle cx="15" cy="24" r="4.1" fill="#ede9fe" />
          <circle cx="20" cy="17" r="4" fill="#c4b5fd" />
          <circle cx="29" cy="14" r="4.3" fill="#ddd6fe" />
          <circle cx="39" cy="16" r="4" fill="#a78bfa" />
          <circle cx="48" cy="22" r="3.8" fill="#8b5cf6" />
          <circle cx="13" cy="34" r="4" fill="#a78bfa" />
          <circle cx="17" cy="44" r="4.2" fill="#7c3aed" />
          <circle cx="25" cy="51" r="4" fill="#6d28d9" />
          <circle cx="37" cy="51" r="4" fill="#7c3aed" />
          <circle cx="47" cy="45" r="4" fill="#6d28d9" />

          <circle cx="21" cy="29" r="2.7" fill="#fff" opacity=".2" />
          <circle cx="34" cy="20" r="2.4" fill="#fff" opacity=".18" />
          <circle cx="45" cy="36" r="2.8" fill="#ddd6fe" opacity=".22" />
          <circle cx="29" cy="45" r="3" fill="#c4b5fd" opacity=".2" />

          <Face state={activeState} gazeLeft={isTyping || lookAtPrompt || isGlancing} />
        </svg>
      </div>

      {showShadow && activeState !== "sleeping" && <div className="kibble-ground-shadow pointer-events-none absolute -bottom-1 h-2 w-3/4 rounded-full bg-violet-950/50 blur-sm" />}
    </div>
  );
}
