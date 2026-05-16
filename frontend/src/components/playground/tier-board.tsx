'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '@/store/playground-store';
import { usePlaygroundSocket } from '@/hooks/use-socket';
import { TierRow } from './tier-row';
import { DraggableItem } from './draggable-item';
import { ItemCard } from './item-card';
import { AggregatePanel } from './aggregate-panel';
import { OnlinePresence } from './online-presence';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Users, BarChart3 } from 'lucide-react';

export function TierBoard() {
  const {
    playground,
    items,
    tiers,
    userVotes,
    aggregates,
    isLocked,
    isConnected,
    participantCount,
  } = usePlaygroundStore();

  const { castVote, removeVote } = usePlaygroundSocket(playground?.id || null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAggregates, setShowAggregates] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  // Group items by tier based on user votes
  const getItemsForTier = useCallback(
    (tierId: string) => {
      return items.filter((item) => {
        const vote = userVotes.find((v) => v.itemId === item.id);
        return vote?.tierId === tierId;
      });
    },
    [items, userVotes],
  );

  // Items not yet placed in any tier
  const unplacedItems = items.filter(
    (item) => !userVotes.find((v) => v.itemId === item.id),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || isLocked) return;

    const itemId = active.id as string;
    const tierId = over.id as string;

    // Check if dropped on a tier
    const tier = tiers.find((t) => t.id === tierId);
    if (tier) {
      castVote(itemId, tierId);
    }
  };

  if (!playground) return null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Badge variant={isConnected ? 'success' : 'destructive'}>
            <span className={`mr-1.5 h-2 w-2 rounded-full inline-block ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'Live' : 'Disconnected'}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {participantCount} online
          </Badge>
          {isLocked && (
            <Badge variant="warning" className="gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </div>

        <button
          onClick={() => setShowAggregates(!showAggregates)}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          {showAggregates ? 'Hide' : 'Show'} Results
        </button>
      </motion.div>

      {/* Online presence */}
      <OnlinePresence />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Board */}
        <div className={showAggregates ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-2">
              <AnimatePresence>
                {tiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TierRow
                      tier={tier}
                      items={getItemsForTier(tier.id)}
                      isLocked={isLocked}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Unplaced Items Pool */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 rounded-xl border-2 border-dashed border-muted-foreground/20 p-4"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Drag items to a tier ({unplacedItems.length} remaining)
              </h3>
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {unplacedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <DraggableItem item={item} disabled={isLocked} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {unplacedItems.length === 0 && (
                  <p className="text-sm text-muted-foreground/50 italic">
                    All items have been placed!
                  </p>
                )}
              </div>
            </motion.div>

            <DragOverlay>
              {activeItem && <ItemCard item={activeItem} isDragging />}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Aggregates Panel */}
        {showAggregates && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <AggregatePanel />
          </motion.div>
        )}
      </div>
    </div>
  );
}
