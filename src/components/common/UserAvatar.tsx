import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  email?: string;
  avatarUrl?: string; // only if real user-provided upload
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * UserAvatar — Text-based initials inside a styled circular avatar.
 * Uses the user's real name when available, with neutral icon fallback.
 * Never displays default stock photos or AI-generated human faces.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  email = '',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  // If user explicitly uploaded a personal custom photo (e.g. data: or blob: or verified upload)
  const hasUserUpload =
    avatarUrl &&
    !avatarUrl.includes('unsplash.com') &&
    !avatarUrl.includes('placeholder') &&
    (avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:') || avatarUrl.startsWith('/uploads/'));

  // Calculate initials from real name
  const trimmedName = name.trim();
  let initials = '';
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      initials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0].slice(0, 2).toUpperCase();
    }
  } else if (email) {
    initials = email.slice(0, 2).toUpperCase();
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 28,
  };

  if (hasUserUpload) {
    return (
      <div
        className={`rounded-full overflow-hidden border-2 border-[#FF7A24]/30 shadow-xs shrink-0 ${sizeClasses[size]} ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name || 'User Avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-[#FF8F3D] to-[#FF7A24] text-white font-display font-bold flex items-center justify-center border-2 border-white shadow-xs shrink-0 select-none ${sizeClasses[size]} ${className}`}
      title={name || email || 'User Profile'}
      aria-label={name ? `${name} avatar` : 'User Profile'}
    >
      {initials ? (
        <span className="tracking-tight">{initials}</span>
      ) : (
        <User size={iconSizes[size]} className="text-white/90" />
      )}
    </div>
  );
};
