import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    socket = io(`${WS_URL}/playground`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket() {
  disconnectSocket();
  return getSocket();
}

// Socket event types
export const SOCKET_EVENTS = {
  // Emit
  JOIN_PLAYGROUND: 'playground:join',
  LEAVE_PLAYGROUND: 'playground:leave',
  CAST_VOTE: 'vote:cast',
  REMOVE_VOTE: 'vote:remove',
  ITEM_DRAG: 'item:drag',
  CURSOR_MOVE: 'cursor:move',
  LOCK_PLAYGROUND: 'playground:lock',

  // Listen
  PLAYGROUND_STATE: 'playground:state',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  VOTE_UPDATE: 'vote:update',
  VOTE_REMOVED: 'vote:removed',
  VOTE_ERROR: 'vote:error',
  AGGREGATES_UPDATE: 'aggregates:update',
  PRESENCE_UPDATE: 'presence:update',
  ITEM_DRAGGING: 'item:dragging',
  CURSOR_UPDATE: 'cursor:update',
  PLAYGROUND_LOCKED: 'playground:locked',
} as const;
