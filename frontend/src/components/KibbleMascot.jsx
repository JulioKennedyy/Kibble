/**
 * KibbleMascot — SVG dot-matrix mascot with three states:
 *   idle    → calm cyan grid
 *   loading → animated pulse wave
 *   error   → red X pattern
 *
 * The dot grid is 5×5, each dot addressed as (col, row).
 */

const DOT = 5;
const GAP = 3;
const R = 2.2;
const TOTAL = DOT * (R * 2) + (DOT - 1) * GAP; // ≈ 34px viewBox

// Dot positions [col, row] for each state pattern
const PATTERNS = {
  idle: [
    [0,0],[1,0],[2,0],[3,0],[4,0],
    [0,1],[2,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],
    [0,3],[2,3],[4,3],
    [0,4],[1,4],[2,4],[3,4],[4,4],
  ],
  loading: [
    [0,0],[1,0],[2,0],[3,0],[4,0],
    [0,1],[1,1],[2,1],[3,1],[4,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],
    [0,3],[1,3],[2,3],[3,3],[4,3],
    [0,4],[1,4],[2,4],[3,4],[4,4],
  ],
  error: [
    [0,0],[4,0],
    [1,1],[3,1],
    [2,2],
    [1,3],[3,3],
    [0,4],[4,4],
  ],
};

function cx(col) { return col * (R * 2 + GAP) + R; }
function cy(row) { return row * (R * 2 + GAP) + R; }

export function KibbleMascot({ state = "idle" }) {
  const dots = PATTERNS[state] ?? PATTERNS.idle;

  const dotColor =
    state === "error"   ? "#f87171"  // red-400
    : state === "loading" ? "#67e8f9" // cyan-300
    : "#22d3ee";                      // cyan-400

  return (
    <svg
      aria-label={`Kibble mascot — ${state}`}
      height={TOTAL}
      role="img"
      viewBox={`0 0 ${TOTAL} ${TOTAL}`}
      width={TOTAL}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background faint grid */}
      {Array.from({ length: DOT }, (_, row) =>
        Array.from({ length: DOT }, (_, col) => (
          <circle
            key={`bg-${col}-${row}`}
            cx={cx(col)}
            cy={cy(row)}
            r={R}
            fill={dotColor}
            opacity={0.08}
          />
        ))
      )}

      {/* Active dots */}
      {dots.map(([col, row], i) => (
        <circle
          key={`dot-${col}-${row}`}
          cx={cx(col)}
          cy={cy(row)}
          r={R}
          fill={dotColor}
          opacity={1}
        >
          {state === "loading" && (
            <animate
              attributeName="opacity"
              values="1;0.25;1"
              dur="1.4s"
              begin={`${(i * 0.06).toFixed(2)}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}
    </svg>
  );
}
