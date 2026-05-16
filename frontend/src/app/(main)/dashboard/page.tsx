'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  TrendingUp,
  Layers,
  Users,
  BarChart3,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { playgroundsApi } from '@/lib/api';
import { Playground } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: playgroundsData, isLoading } = useQuery({
    queryKey: ['playgrounds', page, search],
    queryFn: async () => {
      const { data } = await playgroundsApi.getAll(page, 12, search || undefined);
      return data.data || data;
    },
  });

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const { data } = await playgroundsApi.getTrending(6);
      return data.data || data;
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Playgrounds</h1>
          <p className="text-muted-foreground mt-1">
            Join a playground and start ranking
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playgrounds..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Trending */}
      {trending && trending.length > 0 && !search && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Trending</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.slice(0, 3).map((pg: any, i: number) => (
              <motion.div
                key={pg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PlaygroundCard playground={pg} featured />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* All Playgrounds */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          All Playgrounds
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playgroundsData?.playgrounds?.map((pg: Playground, i: number) => (
                <motion.div
                  key={pg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <PlaygroundCard playground={pg} />
                </motion.div>
              ))}
            </div>

            {playgroundsData?.playgrounds?.length === 0 && (
              <div className="text-center py-16">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No playgrounds found</p>
              </div>
            )}

            {/* Pagination */}
            {playgroundsData && playgroundsData.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  {page} / {playgroundsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === playgroundsData.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PlaygroundCard({ playground, featured }: { playground: any; featured?: boolean }) {
  return (
    <Link href={`/playground/${playground.slug}`}>
      <Card
        className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
          featured ? 'border-primary/30 hover:border-primary/50' : ''
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {playground.title}
            </h3>
            <Badge variant={playground.status === 'ACTIVE' ? 'success' : 'secondary'} className="shrink-0 ml-2">
              {playground.status === 'ACTIVE' ? 'Live' : playground.status}
            </Badge>
          </div>

          {playground.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {playground.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {playground._count?.items || 0} items
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {playground.analytics?.totalVotes || 0} votes
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {playground.analytics?.totalViews || 0} views
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(playground.createdAt)}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
