'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { analyticsApi } from '@/lib/api';
import { formatRelativeTime, getInitials } from '@/lib/utils';

export default function AnalyticsPage() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: async () => {
      const { data } = await analyticsApi.getActivityFeed(1, 50);
      return data.data || data;
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          Activity Feed
        </h1>
        <p className="text-muted-foreground mt-1">Recent activity across all playgrounds</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {feed?.activities?.map((activity: any, index: number) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs gradient-primary text-white">
                      {getInitials(activity.user?.displayName || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {activity.user?.displayName || 'Unknown'}
                      </span>{' '}
                      {activity.message}
                    </p>
                    {activity.playground && (
                      <p className="text-xs text-muted-foreground truncate">
                        in {activity.playground.title}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {(!feed?.activities || feed.activities.length === 0) && (
            <div className="text-center py-16">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
