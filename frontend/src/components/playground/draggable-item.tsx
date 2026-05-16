'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Item } from '@/types';
import { ItemCard } from './item-card';

interface DraggableItemProps {
  item: Item;
  disabled?: boolean;
}

export function DraggableItem({ item, disabled }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ItemCard item={item} isDragging={isDragging} />
    </div>
  );
}
