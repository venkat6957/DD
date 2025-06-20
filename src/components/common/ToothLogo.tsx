// ToothLogo.tsx
export function ToothLogo({ className = "h-8 w-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#shadow)">
        <path
          d="M16 4C10 4 6 8.5 6 14.5C6 20.5 10 28 16 28C22 28 26 20.5 26 14.5C26 8.5 22 4 16 4Z"
          fill="#2563eb"
          stroke="#fff"
          strokeWidth="2.5"
        />
        <ellipse
          cx="16"
          cy="13"
          rx="4"
          ry="2"
          fill="white"
          opacity="0.8"
        />
      </g>
      <defs>
        <filter id="shadow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.10"/>
        </filter>
      </defs>
    </svg>
  );
}