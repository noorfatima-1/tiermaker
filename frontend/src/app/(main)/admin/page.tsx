'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  Users,
  Layers,
  BarChart3,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  Eye,
  Edit3,
  Loader2,
  X,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { playgroundsApi, analyticsApi, tiersApi, itemsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  // Redirect if not admin
  if (user?.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await analyticsApi.getDashboard();
      return data.data || data;
    },
  });

  const { data: playgroundsData, isLoading } = useQuery({
    queryKey: ['adminPlaygrounds'],
    queryFn: async () => {
      const { data } = await playgroundsApi.getAdmin(1, 50);
      return data.data || data;
    },
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => playgroundsApi.toggleLock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaygrounds'] });
      toast.success('Playground status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playgroundsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaygrounds'] });
      toast.success('Playground deleted');
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => playgroundsApi.resetVotes(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaygrounds'] });
      toast.success('Votes reset');
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your platform</p>
          </div>
        </div>
        <Button variant="gradient" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Playground
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? '-', icon: Users, color: 'text-blue-500' },
          { label: 'Playgrounds', value: stats?.totalPlaygrounds ?? '-', icon: Layers, color: 'text-violet-500' },
          { label: 'Total Votes', value: stats?.totalVotes ?? '-', icon: BarChart3, color: 'text-green-500' },
          { label: 'Active', value: stats?.activePlaygrounds ?? '-', icon: Activity, color: 'text-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Playgrounds List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            All Playgrounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {playgroundsData?.playgrounds?.map((pg: any) => (
                <motion.div
                  key={pg.id}
                  layout
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{pg.title}</h3>
                      <Badge
                        variant={
                          pg.status === 'ACTIVE'
                            ? 'success'
                            : pg.status === 'LOCKED'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {pg.status}
                      </Badge>
                      <Badge variant="outline">{pg.visibility}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{pg._count?.items || 0} items</span>
                      <span>{pg.analytics?.totalVotes || 0} votes</span>
                      <span>{pg.analytics?.totalViews || 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/playground/${pg.slug}`)}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => lockMutation.mutate(pg.id)}
                      title={pg.status === 'LOCKED' ? 'Unlock' : 'Lock'}
                    >
                      {pg.status === 'LOCKED' ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Reset all votes?')) resetMutation.mutate(pg.id);
                      }}
                      title="Reset votes"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this playground?')) deleteMutation.mutate(pg.id);
                      }}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Playground Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreatePlaygroundModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreatePlaygroundModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
  });
  const [tierInputs, setTierInputs] = useState([
    { name: 'S', label: 'S Tier', color: '#FF7F7F', score: 5 },
    { name: 'A', label: 'A Tier', color: '#FFBF7F', score: 4 },
    { name: 'B', label: 'B Tier', color: '#FFFF7F', score: 3 },
    { name: 'C', label: 'C Tier', color: '#7FFF7F', score: 2 },
    { name: 'D', label: 'D Tier', color: '#7F7FFF', score: 1 },
  ]);
  const [itemInput, setItemInput] = useState('');

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setIsLoading(true);
    try {
      const { data: pgRes } = await playgroundsApi.create(form);
      const pg = pgRes.data || pgRes;

      // Create tiers
      await tiersApi.createBatch(
        pg.id,
        tierInputs.map((t, i) => ({ ...t, orderIndex: i })),
      );

      // Create items if any
      if (itemInput.trim()) {
        const items = itemInput
          .split('\n')
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name, i) => ({ name, orderIndex: i }));
        if (items.length > 0) {
          await itemsApi.createBatch(pg.id, items);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['adminPlaygrounds'] });
      toast.success('Playground created!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create playground');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-2xl border shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Create Playground</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="Best Programming Languages 2024"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Rank your favorites..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <div className="flex gap-2">
              {(['PUBLIC', 'PRIVATE'] as const).map((v) => (
                <Button
                  key={v}
                  variant={form.visibility === v ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setForm({ ...form, visibility: v })}
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tiers</label>
            <div className="space-y-2">
              {tierInputs.map((tier, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tier.color}
                    onChange={(e) => {
                      const updated = [...tierInputs];
                      updated[i].color = e.target.value;
                      setTierInputs(updated);
                    }}
                    className="h-8 w-8 rounded cursor-pointer"
                  />
                  <Input
                    value={tier.name}
                    onChange={(e) => {
                      const updated = [...tierInputs];
                      updated[i].name = e.target.value;
                      setTierInputs(updated);
                    }}
                    className="w-16"
                  />
                  <Input
                    value={tier.label}
                    onChange={(e) => {
                      const updated = [...tierInputs];
                      updated[i].label = e.target.value;
                      setTierInputs(updated);
                    }}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12 text-center">
                    ={tier.score}pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Items (one per line)</label>
            <textarea
              placeholder={"TypeScript\nPython\nRust\nGo"}
              value={itemInput}
              onChange={(e) => setItemInput(e.target.value)}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" onClick={handleCreate} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              'Create Playground'
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
