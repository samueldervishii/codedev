import { useState } from 'react';
import { BADGE_MAP } from '../../lib/badges';

interface BadgeDisplayProps {
  badgeIds: string[];
  /** Show full badge cards in a grid (profile view) */
  variant?: 'grid' | 'inline';
}

export function BadgeDisplay({ badgeIds, variant = 'grid' }: BadgeDisplayProps) {
  if (!badgeIds || badgeIds.length === 0) return null;

  const badges = badgeIds
    .map((id) => BADGE_MAP.get(id))
    .filter(Boolean);

  if (badges.length === 0) return null;

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-0.5">
        {badges.slice(0, 3).map((badge) => (
          <BadgeTooltip key={badge!.id} name={badge!.name} description={badge!.description}>
            <span className="cursor-default text-xs leading-none" title={badge!.name}>
              {badge!.icon}
            </span>
          </BadgeTooltip>
        ))}
        {badges.length > 3 && (
          <span className="text-[10px] text-gray-500">+{badges.length - 3}</span>
        )}
      </span>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {badges.map((badge) => (
        <div
          key={badge!.id}
          className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2"
        >
          <span className="text-lg">{badge!.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{badge!.name}</p>
            <p className="truncate text-[10px] text-gray-500">{badge!.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BadgeTooltip({
  name,
  description,
  children,
}: {
  name: string;
  description: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-[10px] text-gray-200 shadow-lg">
          <span className="font-semibold">{name}</span>
          <span className="text-gray-400"> — {description}</span>
        </span>
      )}
    </span>
  );
}
