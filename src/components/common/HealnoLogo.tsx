import React from 'react';

interface HealnoLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

/**
 * HealnoLogo — Pure code-based SVG recreation of the official Healno brand mark.
 * Exact recreation of the vibrant orange rounded medical cross with centered white heart.
 * Matches design, shapes, proportions, and colors from reference image.
 */
export const HealnoLogo: React.FC<HealnoLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  textColor = '#132A1F',
}) => {
  const sizeMap: Record<string, string> = {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '52px',
    xl: '64px',
  };
  const dimension = typeof size === 'number' ? `${size}px` : (sizeMap[size] || size);

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Healno Brand Logo"
        role="img"
        className="shrink-0 transition-transform duration-200"
      >
        {/* 
          Main Orange Rounded Cross:
          Width: 156px (42 to 198), Height: 156px (42 to 198)
          Arm thickness: 68px
          Outer cap corners: rx/ry = 26px
          Inner concave corner fillets: r = 8px
        */}
        <path
          d="
            M 112 42
            L 128 42
            C 143 42 154 53 154 68
            L 154 78
            C 154 83 157 86 162 86
            L 172 86
            C 187 86 198 97 198 112
            L 198 128
            C 198 143 187 154 172 154
            L 162 154
            C 157 154 154 157 154 162
            L 154 172
            C 154 187 143 198 128 198
            L 112 198
            C 97 198 86 187 86 172
            L 86 162
            C 86 157 83 154 78 154
            L 68 154
            C 53 154 42 143 42 128
            L 42 112
            C 42 97 53 86 68 86
            L 78 86
            C 83 86 86 83 86 78
            L 86 68
            C 86 53 97 42 112 42
            Z
          "
          fill="#FF6A00"
        />

        {/* 
          Centered White Heart Motif:
          Smooth curved lobes, natural center cleft, gracefully tapering to bottom point
        */}
        <path
          d="
            M 120 100
            C 114 87 99 83 87 90
            C 75 97 73 111 80 123
            C 88 136 106 148 120 158
            C 134 148 152 136 160 123
            C 167 111 165 97 153 90
            C 141 83 126 87 120 100
            Z
          "
          fill="#FFFFFF"
        />
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
