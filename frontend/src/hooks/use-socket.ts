'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getSocket, disconnectSocket, SOCKET_EVENTS } from '@/lib/socket';
import { usePlaygroundStore } from '@/store/playground-store';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

export function usePlaygroundSocket(playgroundId: string | null) {
  const socketRef = useRef(getSocket());
  const { isAuthenticated } = useAuthStore();
  const {
    setUserVotes,
    setAggregates,
    setOnlineUsers,
    setParticipantCount,
    setIsConnected,
    setIsLocked,
    addUserVote,
    updateAggregate,
  } = usePlaygroundStore();

  useEffect(() => {
    if (!playgroundId || !isAuthenticated) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit(SOCKET_EVENTS.JOIN_PLAYGROUND, { playgroundId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Initial state
    socket.on(SOCKET_EVENTS.PLAYGROUND_STATE, (data: any) => {
      setUserVotes(data.userVotes || []);
      setAggregates(data.aggregates || []);
      setOnlineUsers(data.onlineUsers || []);
      setParticipantCount(data.participantCount || 0);
    });

    // User events
    socket.on(SOCKET_EVENTS.USER_JOINED, (data: any) => {
      setParticipantCount(data.participantCount);
      toast.success(`${data.username} joined`, { duration: 2000, position: 'bottom-right' });
    });

    socket.on(SOCKET_EVENTS.USER_LEFT, (data: any) => {
      setParticipantCount(data.participantCount);
    });

    // Vote events
    socket.on(SOCKET_EVENTS.VOTE_UPDATE, (data: any) => {
      if (data.aggregation) {
        updateAggregate(data.itemId, data.aggregation);
      }
    });

    socket.on(SOCKET_EVENTS.AGGREGATES_UPDATE, (data: any) => {
      setAggregates(data);
    });

    // Presence
    socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, (data: any) => {
      setOnlineUsers(data.onlineUsers || []);
      setParticipantCount(data.count || 0);
    });

    // Lock state
    socket.on(SOCKET_EVENTS.PLAYGROUND_LOCKED, (data: any) => {
      setIsLocked(data.locked);
      toast(data.locked ? 'Playground locked' : 'Playground unlocked', {
        icon: data.locked ? '🔒' : '🔓',
      });
    });

    socket.on(SOCKET_EVENTS.VOTE_ERROR, (data: any) => {
      toast.error(data.message);
    });

    // Connect if not connected
    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit(SOCKET_EVENTS.JOIN_PLAYGROUND, { playgroundId });
    }

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_PLAYGROUND);
      socket.off(SOCKET_EVENTS.PLAYGROUND_STATE);
      socket.off(SOCKET_EVENTS.USER_JOINED);
      socket.off(SOCKET_EVENTS.USER_LEFT);
      socket.off(SOCKET_EVENTS.VOTE_UPDATE);
      socket.off(SOCKET_EVENTS.AGGREGATES_UPDATE);
      socket.off(SOCKET_EVENTS.PRESENCE_UPDATE);
      socket.off(SOCKET_EVENTS.PLAYGROUND_LOCKED);
      socket.off(SOCKET_EVENTS.VOTE_ERROR);
    };
  }, [playgroundId, isAuthenticated]);

  const castVote = useCallback(
    (itemId: string, tierId: string) => {
      socketRef.current?.emit(SOCKET_EVENTS.CAST_VOTE, { itemId, tierId });
    },
    [],
  );

  const removeVote = useCallback(
    (itemId: string) => {
      socketRef.current?.emit(SOCKET_EVENTS.REMOVE_VOTE, { itemId });
    },
    [],
  );

  const emitDrag = useCallback(
    (itemId: string, tierId: string, position: number) => {
      socketRef.current?.emit(SOCKET_EVENTS.ITEM_DRAG, { itemId, tierId, position });
    },
    [],
  );

  return { castVote, removeVote, emitDrag };
}
