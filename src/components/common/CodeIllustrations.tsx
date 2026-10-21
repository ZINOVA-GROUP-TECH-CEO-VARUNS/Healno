import React from 'react';

/**
 * SunMorningIllustration
 * Code-based SVG & CSS illustration of a warm morning sun rising over rolling green hills.
 * Completely replaces raster JPG image assets with high-performance vector code.
 */
export const SunMorningIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Morning sun shining over gentle hills"
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF1D6" />
          <stop offset="60%" stopColor="#FFE0B2" />
          <stop offset="100%" stopColor="#F9D29B" />
        </linearGradient>

        {/* Sun gradient */}
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="100%" stopColor="#FF7A24" />
        </linearGradient>

        {/* Rolling hills gradients */}
        <linearGradient id="backHill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#74C69D" />
          <stop offset="100%" stopColor="#40916C" />
        </linearGradient>
        <linearGradient id="midHill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#52B788" />
          <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>
        <linearGradient id="frontHill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D6A4F" />
          <stop offset="100%" stopColor="#1B4332" />
        </linearGradient>

        {/* Sun glow filter */}
        <filter id="sunGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Sky background */}
      <rect width="400" height="240" fill="url(#skyGrad)" />

      {/* Sun glow aura */}
      <circle cx="200" cy="110" r="65" fill="#FFE5A3" opacity="0.6" filter="url(#sunGlow)" />
      <circle cx="200" cy="110" r="50" fill="#FFD166" opacity="0.8" />

      {/* Radiant Sun disc */}
      <circle cx="200" cy="110" r="38" fill="url(#sunGrad)" />

      {/* Subtle smiling sun face */}
      <path d="M190 108 Q193 113 196 108" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M204 108 Q207 113 210 108" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M194 118 Q200 126 206 118" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
      {/* Rosy cheeks */}
      <circle cx="188" cy="115" r="3" fill="#FF7A24" opacity="0.4" />
      <circle cx="212" cy="115" r="3" fill="#FF7A24" opacity="0.4" />

      {/* Back Hill */}
      <path
        d="M-40 240 Q60 120 180 150 T440 160 L440 240 Z"
        fill="url(#backHill)"
        opacity="0.85"
      />

      {/* Mid Hill with little trees */}
      <path
        d="M-20 240 Q100 150 240 180 T420 180 L420 240 Z"
        fill="url(#midHill)"
      />
      {/* Decorative trees on mid hill */}
      <circle cx="85" cy="165" r="7" fill="#1B4332" opacity="0.6" />
      <circle cx="100" cy="160" r="9" fill="#1B4332" opacity="0.7" />
      <circle cx="115" cy="166" r="6" fill="#1B4332" opacity="0.6" />

      {/* Front Hill */}
      <path
        d="M0 240 Q120 180 280 200 Q360 210 400 240 Z"
        fill="url(#frontHill)"
      />

      {/* Soft warm light rays on the horizon */}
      <circle cx="200" cy="110" r="90" stroke="#FFF7ED" strokeWidth="1" strokeDasharray="4 8" opacity="0.4" />
    </svg>
  );
};

/**
 * WelcomeHealthcareIllustration
 * Code-based healthcare welcome hero illustration
 */
export const WelcomeHealthcareIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="54" fill="#FFF4EB" stroke="#FFE0C8" strokeWidth="2" />
      <circle cx="60" cy="60" r="42" fill="#FFFFFF" />
      {/* Orange Cross */}
      <rect x="52" y="30" width="16" height="60" rx="8" fill="#FF7A24" />
      <rect x="30" y="52" width="60" height="16" rx="8" fill="#FF7A24" />
      {/* Central Heart */}
      <path
        d="M60 74C60 74 46 62 46 52C46 47 50 43 55 43C58 43 59.5 44.5 60 46C60.5 44.5 62 43 65 43C70 43 74 47 74 52C74 62 60 74 60 74Z"
        fill="#FFFFFF"
      />
      {/* Decorative sparkle */}
      <path d="M92 34L94 28L100 26L94 24L92 18L90 24L84 26L90 28L92 34Z" fill="#FF7A24" />
      <circle cx="26" cy="38" r="3" fill="#52B788" />
      <circle cx="94" cy="86" r="4" fill="#74C69D" />
    </svg>
  );
};

/**
 * DiaryJournalIllustration
 * Code-based diary & personal journal illustration
 */
export const DiaryJournalIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="22" y="16" width="56" height="68" rx="8" fill="#FFEFE5" stroke="#FF7A24" strokeWidth="2" />
      <rect x="18" y="20" width="8" height="60" rx="4" fill="#FF7A24" />
      {/* Bookmark ribbon */}
      <path d="M48 16V40L54 35L60 40V16H48Z" fill="#FF7A24" opacity="0.9" />
      {/* Text lines */}
      <line x1="34" y1="48" x2="68" y2="48" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <line x1="34" y1="58" x2="62" y2="58" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <line x1="34" y1="68" x2="52" y2="68" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
};

/**
 * TimelineIllustration
 * Code-based health timeline & symptom progression illustration
 */
export const TimelineIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="44" fill="#F0FDF4" stroke="#DCFCE7" strokeWidth="2" />
      {/* Wave timeline curve */}
      <path
        d="M20 58C30 58 35 34 45 34C55 34 60 66 70 66C76 66 80 50 82 50"
        stroke="#52B788"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Key data nodes */}
      <circle cx="45" cy="34" r="5" fill="#FF7A24" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="70" cy="66" r="5" fill="#2D6A4F" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="20" cy="58" r="4" fill="#52B788" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
};

/**
 * LearningQuizIllustration
 * Code-based learning & evidence-backed mini-test illustration
 */
export const LearningQuizIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="20" width="60" height="65" rx="10" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="2" />
      {/* Lightbulb idea */}
      <path
        d="M50 28C43.5 28 38 33.5 38 40C38 44 40 47 43 49V53H57V49C60 47 62 44 62 40C62 33.5 56.5 28 50 28Z"
        fill="#FF7A24"
      />
      <rect x="45" y="55" width="10" height="3" rx="1.5" fill="#D97706" />
      {/* Checklist items */}
      <rect x="30" y="64" width="40" height="4" rx="2" fill="#132A1F" opacity="0.3" />
      <rect x="30" y="72" width="28" height="4" rx="2" fill="#132A1F" opacity="0.3" />
    </svg>
  );
};

/**
 * ActivityTrackerIllustration
 * Code-based daily activity tracker illustration
 */
export const ActivityTrackerIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="44" fill="#FFF7ED" stroke="#FFEDD5" strokeWidth="2" />
      {/* Circular progress track */}
      <circle cx="50" cy="50" r="32" stroke="#FED7AA" strokeWidth="6" fill="none" />
      <circle
        cx="50"
        cy="50"
        r="32"
        stroke="#FF7A24"
        strokeWidth="6"
        fill="none"
        strokeDasharray="200"
        strokeDashoffset="60"
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      {/* Running/walking stick figure / activity shoe */}
      <path
        d="M42 60L48 48L56 52L62 44"
        stroke="#132A1F"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="54" cy="38" r="4.5" fill="#132A1F" />
    </svg>
  );
};

/**
 * EmptyStateIllustration
 * Reusable code-based empty state illustration with customizable icon & badge
 */
interface EmptyStateIllustrationProps {
  type?: 'symptoms' | 'diary' | 'tasks' | 'meds' | 'appointments' | 'community' | 'search';
  className?: string;
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  type = 'symptoms',
  className = 'w-24 h-24 mx-auto',
}) => {
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft background disk */}
        <circle cx="60" cy="60" r="52" fill="#F8F6F0" stroke="#EAE5D9" strokeWidth="2" strokeDasharray="4 4" />

        {type === 'symptoms' && (
          <g>
            <rect x="36" y="32" width="48" height="56" rx="8" fill="#FFFFFF" stroke="#FF7A24" strokeWidth="2" />
            <line x1="46" y1="46" x2="74" y2="46" stroke="#52B788" strokeWidth="3" strokeLinecap="round" />
            <line x1="46" y1="56" x2="68" y2="56" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="46" y1="66" x2="60" y2="66" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="76" cy="74" r="10" fill="#FF7A24" />
            <path d="M73 74H79M76 71V77" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {type === 'diary' && (
          <g>
            <rect x="34" y="28" width="52" height="64" rx="6" fill="#FFFFFF" stroke="#FF7A24" strokeWidth="2" />
            <path d="M34 28H42V92H34V28Z" fill="#FF7A24" />
            <line x1="50" y1="42" x2="76" y2="42" stroke="#132A1F" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="50" y1="52" x2="72" y2="52" stroke="#132A1F" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="50" y1="62" x2="66" y2="62" stroke="#132A1F" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <circle cx="78" cy="78" r="8" fill="#52B788" />
            <path d="M75 78L77 80L81 76" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {type === 'tasks' && (
          <g>
            <rect x="34" y="30" width="52" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <rect x="42" y="42" width="10" height="10" rx="2" fill="#FF7A24" />
            <line x1="58" y1="47" x2="76" y2="47" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            <rect x="42" y="58" width="10" height="10" rx="2" fill="#E2E8F0" />
            <line x1="58" y1="63" x2="72" y2="63" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            <rect x="42" y="74" width="10" height="10" rx="2" fill="#E2E8F0" />
            <line x1="58" y1="79" x2="68" y2="79" stroke="#132A1F" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
          </g>
        )}

        {type === 'meds' && (
          <g>
            <rect x="44" y="30" width="32" height="60" rx="16" fill="#FFFFFF" stroke="#FF7A24" strokeWidth="2.5" />
            <path d="M44 60H76V74C76 82.8 68.8 90 60 90C51.2 90 44 82.8 44 74V60Z" fill="#FF7A24" />
            <line x1="44" y1="60" x2="76" y2="60" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        )}

        {type === 'appointments' && (
          <g>
            <rect x="34" y="34" width="52" height="52" rx="8" fill="#FFFFFF" stroke="#132A1F" strokeWidth="2" opacity="0.8" />
            <path d="M34 46H86" stroke="#FF7A24" strokeWidth="3" />
            <rect x="44" y="28" width="4" height="10" rx="2" fill="#132A1F" />
            <rect x="72" y="28" width="4" height="10" rx="2" fill="#132A1F" />
            <circle cx="60" cy="65" r="4" fill="#FF7A24" />
          </g>
        )}

        {type === 'community' && (
          <g>
            <circle cx="50" cy="50" r="14" fill="#52B788" />
            <circle cx="70" cy="50" r="14" fill="#FF7A24" opacity="0.9" />
            <path d="M36 78C36 68 44 64 50 64C56 64 64 68 64 78H36Z" fill="#52B788" opacity="0.7" />
            <path d="M56 78C56 68 64 64 70 64C76 64 84 68 84 78H56Z" fill="#FF7A24" opacity="0.7" />
          </g>
        )}

        {type === 'search' && (
          <g>
            <circle cx="54" cy="54" r="18" stroke="#FF7A24" strokeWidth="3" fill="none" />
            <line x1="68" y1="68" x2="82" y2="82" stroke="#FF7A24" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
