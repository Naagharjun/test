import React from 'react';
import { Badge } from '../utils/badges';

const BadgeList: React.FC<{ badges: Badge[], size?: 'sm' | 'md' }> = ({ badges, size = 'md' }) => {
    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map(badge => (
                <div
                    key={badge.id}
                    title={badge.description}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black uppercase tracking-wider shadow-sm border border-white/50 transition-transform hover:scale-105 cursor-help ${badge.color} ${size === 'sm' ? 'text-[8px]' : 'text-[10px]'}`}
                >
                    <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>{badge.icon}</span>
                    {badge.name}
                </div>
            ))}
        </div>
    );
};

export default BadgeList;
