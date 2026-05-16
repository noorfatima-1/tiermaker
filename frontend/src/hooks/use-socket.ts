'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePlaygroundStore } from '@/store/playground-store';
import { useAuthStore } from '@/store/auth-store';
import { votesApi } from '@/lib/api';
import toast from 'react-hot-toast';

// Polling-based realtime (works on Vercel serverless)
export function usePlaygroundSocket(playgroundId: string | null) {
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated } = useAuthStore();
  const {
    setUserVotes,
    setAggregates,
    setIsConnected,
    setParticipantCount,
  } = usePlaygroundStore();

  useEffect(() => {
    if (!playgroundId || !isAuthenticated) return;

    setIsConnected(true);

    // Fetch initial data + poll every 3 seconds
    const fetchData = async () => {
      try {
        const [aggRes, votesRes] = await Promise.all([
          votesApi.getPlaygroundAggregates(playgroundId),
          votesApi.getUserVotes(playgroundId),
        ]);
        setAggregates(aggRes.data?.data || aggRes.data || []);
        setUserVotes(votesRes.data?.data || votesRes.data || []);
      } catch {}
    };

    fetchData();
    pollRef.current = setInterval(fetchData, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      setIsConnected(false);
    };
  }, [playgroundId, isAuthenticated]);

  const castVote = useCallback(
    async (itemId: string, tierId: string) => {
      try {
        await votesApi.cast(itemId, tierId);
        // Immediately fetch updated data
        if (playgroundId) {
          const [aggRes, votesRes] = await Promise.all([
            votesApi.getPlaygroundAggregates(playgroundId),
            votesApi.getUserVotes(playgroundId),
          ]);
          setAggregates(aggRes.data?.data || aggRes.data || []);
          setUserVotes(votesRes.data?.data || votesRes.data || []);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to vote');
      }
    },
    [playgroundId],
  );

  const removeVote = useCallback(
    async (itemId: string) => {
      try {
        await votesApi.remove(itemId);
        if (playgroundId) {
          const [aggRes, votesRes] = await Promise.all([
            votesApi.getPlaygroundAggregates(playgroundId),
            votesApi.getUserVotes(playgroundId),
          ]);
          setAggregates(aggRes.data?.data || aggRes.data || []);
          setUserVotes(votesRes.data?.data || votesRes.data || []);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to remove vote');
      }
    },
    [playgroundId],
  );

  const emitDrag = useCallback(
    (_itemId: string, _tierId: string, _position: number) => {
      // No-op in polling mode
    },
    [],
  );

  return { castVote, removeVote, emitDrag };
}
