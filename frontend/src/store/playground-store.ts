'use client';

import { create } from 'zustand';
import { Playground, Item, Tier, AggregateResult, ItemVote } from '@/types';

interface PlaygroundState {
  playground: Playground | null;
  items: Item[];
  tiers: Tier[];
  userVotes: ItemVote[];
  aggregates: AggregateResult[];
  onlineUsers: string[];
  participantCount: number;
  isLocked: boolean;
  isConnected: boolean;
  draggedItem: string | null;

  setPlayground: (playground: Playground) => void;
  setItems: (items: Item[]) => void;
  setTiers: (tiers: Tier[]) => void;
  setUserVotes: (votes: ItemVote[]) => void;
  setAggregates: (aggregates: AggregateResult[]) => void;
  updateAggregate: (itemId: string, data: Partial<AggregateResult>) => void;
  setOnlineUsers: (users: string[]) => void;
  setParticipantCount: (count: number) => void;
  setIsLocked: (locked: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  setDraggedItem: (itemId: string | null) => void;
  addUserVote: (vote: ItemVote) => void;
  removeUserVote: (itemId: string) => void;
  reset: () => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  playground: null,
  items: [],
  tiers: [],
  userVotes: [],
  aggregates: [],
  onlineUsers: [],
  participantCount: 0,
  isLocked: false,
  isConnected: false,
  draggedItem: null,

  setPlayground: (playground) =>
    set({
      playground,
      items: playground.items || [],
      tiers: playground.tiers || [],
      isLocked: playground.status === 'LOCKED',
    }),

  setItems: (items) => set({ items }),
  setTiers: (tiers) => set({ tiers }),
  setUserVotes: (userVotes) => set({ userVotes }),
  setAggregates: (aggregates) => set({ aggregates }),

  updateAggregate: (itemId, data) =>
    set((state) => ({
      aggregates: state.aggregates.map((a) =>
        a.id === itemId ? { ...a, ...data } : a,
      ),
    })),

  setOnlineUsers: (onlineUsers) =>
    set({ onlineUsers, participantCount: onlineUsers.length }),
  setParticipantCount: (participantCount) => set({ participantCount }),
  setIsLocked: (isLocked) => set({ isLocked }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setDraggedItem: (draggedItem) => set({ draggedItem }),

  addUserVote: (vote) =>
    set((state) => ({
      userVotes: [
        ...state.userVotes.filter((v) => v.itemId !== vote.itemId),
        vote,
      ],
    })),

  removeUserVote: (itemId) =>
    set((state) => ({
      userVotes: state.userVotes.filter((v) => v.itemId !== itemId),
    })),

  reset: () =>
    set({
      playground: null,
      items: [],
      tiers: [],
      userVotes: [],
      aggregates: [],
      onlineUsers: [],
      participantCount: 0,
      isLocked: false,
      isConnected: false,
      draggedItem: null,
    }),
}));
