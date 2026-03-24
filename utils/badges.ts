import { User, Mentor, Review, Resource } from '../types';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export const BADGE_DEFINITIONS: Record<string, Badge> = {
    // Mentor Badges
    'rising-star': { id: 'rising-star', name: 'Rising Star', description: 'Completed 3+ mentorship sessions', icon: '✨', color: 'bg-amber-100 text-amber-700' },
    'community-legend': { id: 'community-legend', name: 'Legend', description: 'Completed 10+ mentorship sessions', icon: '👑', color: 'bg-indigo-100 text-indigo-700' },
    'top-rated': { id: 'top-rated', name: 'Top Rated', description: 'Maintained a 4.5+ rating', icon: '⭐', color: 'bg-emerald-100 text-emerald-700' },
    'knowledge-sharer': { id: 'knowledge-sharer', name: 'Knowledge Sharer', description: 'Shared 3+ resources', icon: '📚', color: 'bg-blue-100 text-blue-700' },

    // Mentee Badges
    'quick-learner': { id: 'quick-learner', name: 'Quick Learner', description: 'Booked 3+ sessions', icon: '🚀', color: 'bg-purple-100 text-purple-700' },
    'pathfinder': { id: 'pathfinder', name: 'Pathfinder', description: 'Booked 10+ sessions', icon: '🧭', color: 'bg-cyan-100 text-cyan-700' },
    'enthusiast': { id: 'enthusiast', name: 'Enthusiast', description: 'Active in the community', icon: '🔥', color: 'bg-rose-100 text-rose-700' },
};

export const calculateBadges = (user: User, sessionCount: number, reviews: Review[] = [], resources: Resource[] = []): Badge[] => {
    if (!user) return [];
    const badges: Badge[] = [];

    if (user.role === 'mentor') {
        if (sessionCount >= 3) badges.push(BADGE_DEFINITIONS['rising-star']);
        if (sessionCount >= 10) badges.push(BADGE_DEFINITIONS['community-legend']);

        const validReviews = (reviews || []).filter(r => r && typeof r.rating === 'number');
        const avgRating = validReviews.length > 0 ? validReviews.reduce((acc, r) => acc + r.rating, 0) / validReviews.length : 0;

        if (validReviews.length >= 3 && avgRating >= 4.5) badges.push(BADGE_DEFINITIONS['top-rated']);

        if ((resources || []).length >= 3) badges.push(BADGE_DEFINITIONS['knowledge-sharer']);
    } else {
        if (sessionCount >= 3) badges.push(BADGE_DEFINITIONS['quick-learner']);
        if (sessionCount >= 10) badges.push(BADGE_DEFINITIONS['pathfinder']);
        if (sessionCount >= 1) badges.push(BADGE_DEFINITIONS['enthusiast']);
    }

    return badges;
};
