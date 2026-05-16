'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Tier, Item } from '@/types';
import { DraggableItem } from './draggable-item';

interface TierRowProps {
  tier: Tier;
  items: Item[];
  isLocked: boolean;
}

export function TierRow({ tier, items, isLocked }: TierRowProps) {
  const { isOver, setNodeRef } = useDroppable({ id: tier.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[80px] rounded-xl border overflow-hidden transition-all duration-200 ${
        isOver
          ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/20 scale-[1.01]'
          : 'hover:border-muted-foreground/30'
      }`}
    >
      {/* Tier Label */}
      <div
        className="flex w-20 sm:w-24 shrink-0 items-center justify-center font-bold text-xl"
        style={{
          backgroundColor: tier.color,
          color: isLightColor(tier.color) ? '#000' : '#fff',
        }}
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          {tier.name}
        </motion.span>
      </div>

      {/* Items area */}
      <div className="flex flex-1 flex-wrap items-center gap-2 p-3 bg-card/50">
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} disabled={isLocked} />
        ))}
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground/40 italic px-2">
            Drop items here
          </span>
        )}
      </div>

      {/* Item count */}
      <div className="flex items-center px-3 text-xs text-muted-foreground">
        {items.length}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}
