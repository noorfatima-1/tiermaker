'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Copy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBoard } from '@/components/playground/tier-board';
import { usePlaygroundStore } from '@/store/playground-store';
import { useAuthStore } from '@/store/auth-store';
import { playgroundsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PlaygroundPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const { setPlayground } = usePlaygroundStore();

  const { data: playground, isLoading, error } = useQuery({
    queryKey: ['playground', slug],
    queryFn: async () => {
      const { data } = await playgroundsApi.getBySlug(slug);
      return data.data || data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (playground) {
      setPlayground(playground);
    }
  }, [playground, setPlayground]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/playground/${slug}`);
    }
  }, [isAuthenticated, slug, router]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const copyInviteCode = () => {
    if (playground?.inviteCode) {
      navigator.clipboard.writeText(playground.inviteCode);
      toast.success('Invite code copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !playground) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Playground not found</h2>
        <p className="text-muted-foreground mb-6">
          This playground may have been deleted or the URL is incorrect.
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">{playground.title}</h1>
              {playground.status === 'LOCKED' && (
                <Badge variant="warning" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
            </div>
            {playground.description && (
              <p className="text-muted-foreground mt-1">{playground.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {playground.inviteCode && (
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                {playground.inviteCode}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="mr-2 h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tier Board */}
      <TierBoard />
    </div>
  );
}
