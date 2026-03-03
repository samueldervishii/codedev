import type { Badge } from '@devhub/shared';

export const BADGES: Badge[] = [
  {
    id: 'first_post',
    name: 'First Post',
    description: 'Created your first post',
    icon: '📝',
    color: '#3b82f6',
  },
  {
    id: 'prolific_poster',
    name: 'Prolific Poster',
    description: 'Created 10 posts',
    icon: '✍️',
    color: '#8b5cf6',
  },
  {
    id: 'commentator',
    name: 'Commentator',
    description: 'Left 50 comments',
    icon: '💬',
    color: '#06b6d4',
  },
  {
    id: 'karma_rookie',
    name: 'Karma Rookie',
    description: 'Reached 100 karma',
    icon: '⭐',
    color: '#f59e0b',
  },
  {
    id: 'karma_pro',
    name: 'Karma Pro',
    description: 'Reached 1,000 karma',
    icon: '🌟',
    color: '#f97316',
  },
  {
    id: 'karma_legend',
    name: 'Karma Legend',
    description: 'Reached 5,000 karma',
    icon: '👑',
    color: '#ef4444',
  },
  {
    id: 'community_creator',
    name: 'Community Creator',
    description: 'Created a community',
    icon: '🏗️',
    color: '#10b981',
  },
  {
    id: 'helpful',
    name: 'Helpful',
    description: 'Received 100 upvotes on comments',
    icon: '🤝',
    color: '#ec4899',
  },
];

export const BADGE_MAP = new Map(BADGES.map((b) => [b.id, b]));
