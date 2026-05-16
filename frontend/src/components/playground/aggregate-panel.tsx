'use client';

import { motion } from 'framer-motion';
import { usePlaygroundStore } from '@/store/playground-store';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { getTierColor } from '@/lib/utils';

export function AggregatePanel() {
  const { aggregates, tiers } = usePlaygroundStore();

  const sortedAggregates = [...aggregates].sort(
    (a, b) => b.averageScore - a.averageScore,
  );

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Live Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {sortedAggregates.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No votes yet. Be the first to rank!
          </p>
        )}
        {sortedAggregates.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {index + 1}. {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.totalVotes} votes
                </span>
                {item.aggregateTier && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: getTierColor(item.aggregateTier) + '30',
                      color: getTierColor(item.aggregateTier),
                    }}
                  >
                    {item.aggregateTier}
                  </span>
                )}
              </div>
            </div>

            {/* Score bar */}
            <div className="flex items-center gap-2">
              <Progress
                value={(item.averageScore / 5) * 100}
                className="h-2"
                indicatorColor={item.aggregateTierColor || getTierColor(item.aggregateTier || '')}
              />
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                {item.averageScore.toFixed(1)}
              </span>
            </div>

            {/* Tier distribution */}
            {item.tierDistribution && (
              <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                {item.tierDistribution.map((td) => (
                  <div
                    key={td.tierId}
                    className="transition-all duration-500"
                    style={{
                      width: `${td.percentage}%`,
                      backgroundColor: td.tierColor,
                      minWidth: td.percentage > 0 ? '2px' : '0',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
