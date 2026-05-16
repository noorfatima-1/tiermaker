'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  BarChart3,
  Layers,
  ArrowRight,
  Globe,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';

const features = [
  {
    icon: Layers,
    title: 'Drag & Drop Tiers',
    description: 'Intuitively rank items by dragging them into S, A, B, C, D tiers with smooth animations.',
  },
  {
    icon: Users,
    title: 'Realtime Collaboration',
    description: 'See live updates from other users instantly. Vote together and watch rankings shift in realtime.',
  },
  {
    icon: BarChart3,
    title: 'Smart Aggregation',
    description: 'Weighted scoring calculates average tiers automatically. See how the community truly ranks items.',
  },
  {
    icon: Globe,
    title: 'Share Anywhere',
    description: 'Generate shareable links or invite codes. Public and private playgrounds for any use case.',
  },
  {
    icon: Shield,
    title: 'Admin Controls',
    description: 'Full admin dashboard to create, manage, lock playgrounds, and view detailed analytics.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful UI',
    description: 'Modern, responsive design with dark/light mode, fluid animations, and mobile-first approach.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px] animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px] animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-2xl shadow-violet-500/30"
            >
              <Zap className="h-10 w-10 text-white" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="gradient-text">Rank Everything</span>
              <br />
              <span className="text-foreground">Together in Realtime</span>
            </h1>

            <p className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground">
              Create tier lists, collaborate live with others, and see aggregated
              rankings update instantly. The ultimate collaborative ranking platform.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button variant="gradient" size="xl" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="xl">
                  Browse Playgrounds
                </Button>
              </Link>
            </motion.div>

            {/* Animated tier preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 mx-auto max-w-3xl"
            >
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-4 shadow-2xl shadow-violet-500/5">
                {['S', 'A', 'B', 'C', 'D'].map((tier, i) => {
                  const colors = ['#FF7F7F', '#FFBF7F', '#FFFF7F', '#7FFF7F', '#7F7FFF'];
                  const items = [
                    ['React', 'TypeScript', 'Rust'],
                    ['Python', 'Go'],
                    ['Java', 'Swift', 'Kotlin'],
                    ['PHP', 'Ruby'],
                    ['COBOL'],
                  ];
                  return (
                    <motion.div
                      key={tier}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center mb-1.5 last:mb-0"
                    >
                      <div
                        className="flex h-12 w-14 items-center justify-center rounded-l-lg font-bold text-lg shrink-0"
                        style={{
                          backgroundColor: colors[i],
                          color: i < 3 ? '#000' : '#fff',
                        }}
                      >
                        {tier}
                      </div>
                      <div className="flex flex-1 items-center gap-2 rounded-r-lg border-y border-r bg-card/80 px-3 h-12">
                        {items[i].map((name) => (
                          <span
                            key={name}
                            className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything you need for{' '}
              <span className="gradient-text">collaborative ranking</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Built with modern tech for the best experience. Realtime, scalable, and beautiful.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item}>
                <Card className="h-full hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl gradient-primary p-12 shadow-2xl shadow-violet-500/20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start ranking?
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join thousands of users creating and sharing tier lists in realtime.
            </p>
            <Link href="/register">
              <Button size="xl" className="bg-white text-violet-700 hover:bg-white/90 shadow-lg">
                Create Your First Tier List
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">TierMaker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, NestJS, Socket.IO & Redis
          </p>
        </div>
      </footer>
    </div>
  );
}
