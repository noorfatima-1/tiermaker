'use client';

import { motion } from 'framer-motion';
import { usePlaygroundStore } from '@/store/playground-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function OnlinePresence() {
  const { onlineUsers } = usePlaygroundStore();

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 8).map((userId, index) => (
          <motion.div
            key={userId}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback
                className={`text-xs text-white ${COLORS[index % COLORS.length]}`}
              >
                {userId.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        ))}
      </div>
      {onlineUsers.length > 8 && (
        <span className="text-xs text-muted-foreground">
          +{onlineUsers.length - 8} more
        </span>
      )}
    </div>
  );
}
