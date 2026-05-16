export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
}

export interface Playground {
  id: string;
  title: string;
  description?: string;
  slug: string;
  coverImage?: string;
  status: 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE';
  inviteCode?: string;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  tiers: Tier[];
  items: Item[];
  analytics?: PlaygroundAnalytics;
  _count?: { items: number; sessions: number };
}

export interface Tier {
  id: string;
  name: string;
  label: string;
  color: string;
  score: number;
  orderIndex: number;
  playgroundId: string;
}

export interface Item {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  orderIndex: number;
  playgroundId: string;
  totalVotes: number;
  averageScore: number;
  aggregateTier?: string;
  _count?: { votes: number };
}

export interface ItemVote {
  id: string;
  userId: string;
  itemId: string;
  tierId: string;
  score: number;
  item?: Item;
  tier?: Tier;
}

export interface PlaygroundAnalytics {
  id: string;
  playgroundId: string;
  totalViews: number;
  totalVotes: number;
  uniqueVisitors: number;
  peakConcurrent: number;
}

export interface AggregateResult {
  id: string;
  name: string;
  imageUrl?: string;
  totalVotes: number;
  averageScore: number;
  aggregateTier: string;
  aggregateTierColor?: string;
  tierDistribution?: TierDistribution[];
}

export interface TierDistribution {
  tierId: string;
  tierName: string;
  tierColor: string;
  count: number;
  percentage: number;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  metadata?: any;
  userId?: string;
  playgroundId?: string;
  createdAt: string;
  user?: Pick<User, 'displayName' | 'avatar'>;
  playground?: Pick<Playground, 'title' | 'slug'>;
}

export interface OnlineUser {
  userId: string;
  username: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
