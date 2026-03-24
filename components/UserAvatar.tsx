import React from 'react';

interface UserAvatarProps {
    src?: string;
    name?: string;
    role?: string;
    size?: number;          // pixel size (width & height)
    className?: string;
}

/**
 * A simple, clean human silhouette avatar.
 * Background colour is derived from the user's name so each person gets a consistent unique colour.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({ src, name = '', role, size = 40, className = '' }) => {
    // Generate a stable hue from the name string
    const safeName = typeof name === 'string' ? name : '';
    const hue = safeName.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

    const bg = `hsl(${hue}, 55%, 88%)`;
    const fg = `hsl(${hue}, 55%, 35%)`;

    if (src) {
        return (
            <img
                src={src}
                alt={name || 'User'}
                width={size}
                height={size}
                className={`object-cover rounded-full ${className}`}
                style={{ width: size, height: size }}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        );
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label={name || role || 'User'}
        >
            {/* Background circle */}
            <rect width="40" height="40" rx="20" fill={bg} />

            {/* Head */}
            <circle cx="20" cy="15" r="7" fill={fg} />

            {/* Body / shoulders */}
            <path
                d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14"
                fill={fg}
            />
        </svg>
    );
};

export default UserAvatar;
