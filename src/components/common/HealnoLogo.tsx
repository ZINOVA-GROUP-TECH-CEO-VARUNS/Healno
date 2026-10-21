import React from 'react';

interface HealnoLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

/**
 * HealnoLogo — Code-based vector logo
 * Combines an orange medical cross (#FF7A24) with an integrated healing heart symbol.
 */
export const HealnoLogo: React.FC<HealnoLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  textColor = '#132A1F',
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Healno Logo"
        role="img"
        className="shrink-0 transition-transform duration-200"
      >
        <defs>
          <linearGradient id="healnoOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8F3D" />
            <stop offset="100%" stopColor="#FF7A24" />
          </linearGradient>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FF7A24" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Rounded square container with soft orange gradient */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#healnoOrangeGrad)"
          filter="url(#softGlow)"
        />

        {/* Outer White Medical Cross with soft rounded pill ends */}
        {/* Vertical cross bar */}
        <rect x="41" y="20" width="18" height="60" rx="9" fill="#FFFFFF" />
        {/* Horizontal cross bar */}
        <rect x="20" y="41" width="60" height="18" rx="9" fill="#FFFFFF" />

        {/* Central Heart Motif in Healno Orange cut out of the cross center */}
        <path
          d="M50 63.5C50 63.5 35 52.5 35 43.5C35 38.5 39 34.5 44 34.5C47 34.5 49 36 50 37.5C51 36 53 34.5 56 34.5C61 34.5 65 38.5 65 43.5C65 52.5 50 63.5 50 63.5Z"
          fill="#FF7A24"
        />

        {/* Small subtle accent spark at top-right of cross */}
        <circle cx="73" cy="27" r="3.5" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {showText && (
        <span
          className="font-display font-extrabold tracking-tight text-lg"
          style={{ color: textColor }}
        >
          Healno
        </span>
      )}
    </div>
  );
};
