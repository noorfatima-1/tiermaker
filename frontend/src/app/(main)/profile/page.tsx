'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Hash, Calendar, BarChart3, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { usersApi } from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data } = await usersApi.getProfile();
      return data.data || data;
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await usersApi.updateProfile({ displayName });
      const updatedUser = data.data || data;
      setUser({ ...user!, displayName: updatedUser.displayName });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg gradient-primary text-white">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.displayName}</h2>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input value={user.email} disabled className="opacity-60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Username
                </label>
                <Input value={user.username} disabled className="opacity-60" />
              </div>
              <Button onClick={handleSave} disabled={isSaving} variant="gradient">
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{stats?.totalVotes || 0}</p>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Layers className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{stats?.playgroundsJoined || 0}</p>
            <p className="text-sm text-muted-foreground">Playgrounds Joined</p>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Member since {formatDate(user.createdAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
