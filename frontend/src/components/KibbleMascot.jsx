/**
 * KibbleMascot — Kibble's single colorful dot.
 * The face keeps the mark recognizable without turning it into a group of dots.
 */

export function KibbleMascot({ state = "idle" }) {
  const isError = state === "error";
  const color = isError ? "#f87171" : "#f59e0b";

  return (
    <svg
      aria-label={`Kibble mascot — ${state}`}
      height="34"
      role="img"
      viewBox="0 0 34 34"
      width="34"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity={isError ? 0.7 : 1}>
        <circle cx="17" cy="17" r="11" fill={color} />
        <circle cx="13.5" cy="15" r="1.5" fill="#071216" />
        <circle cx="20.5" cy="15" r="1.5" fill="#071216" />
        <path d="M12.5 20c2.5 2 6.5 2 9 0" fill="none" stroke="#071216" strokeLinecap="round" strokeWidth="1.5" />
        {state === "loading" && (
          <animate
            attributeName="opacity"
            values="1;0.45;1"
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
      </g>
    </svg>
  );
}
