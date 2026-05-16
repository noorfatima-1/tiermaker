'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Item } from '@/types';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: Item;
  isDragging?: boolean;
  showStats?: boolean;
}

export function ItemCard({ item, isDragging, showStats }: ItemCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm transition-all select-none',
        isDragging && 'drag-overlay z-50 rotate-2',
        'hover:shadow-md hover:border-primary/30',
      )}
    >
      {item.imageUrl && (
        <div className="relative h-8 w-8 overflow-hidden rounded-md shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      )}
      <span className="text-sm font-medium truncate max-w-[120px]">{item.name}</span>

      {showStats && item.totalVotes > 0 && (
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {item.averageScore.toFixed(1)}
          </span>
          {item.aggregateTier && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: getTierBg(item.aggregateTier) }}
            >
              {item.aggregateTier}
            </span>
          )}
        </div>
      )}

      {/* Vote count indicator */}
      {item.totalVotes > 0 && !showStats && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
          {item.totalVotes}
        </span>
      )}
    </motion.div>
  );
}

function getTierBg(tier: string): string {
  const colors: Record<string, string> = {
    S: '#FF7F7F40',
    A: '#FFBF7F40',
    B: '#FFFF7F40',
    C: '#7FFF7F40',
    D: '#7F7FFF40',
  };
  return colors[tier] || '#88888840';
}
