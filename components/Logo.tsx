export function Logo({ size = 28 }: { size?: number }) {
  const id = "lp-grad";
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.5"
      />
      <circle cx="20" cy="20" r="6" fill={`url(#${id})`} />
      <path
        d="M20 2v6M20 32v6M2 20h6M32 20h6"
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
