import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/data';
import { ArrowUpRight, Activity, Clock, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const KPIGrid = ({ projects }: { projects: Project[] }) => {
  const liveProjects = projects.filter(p => p.category === 'Live');
  const delayedProjects = liveProjects.filter(p => p.status === 'Delayed' || p.status === 'Critical');
  
  const avgProgress = liveProjects.length 
    ? Math.round(liveProjects.reduce((acc, curr) => acc + curr.progress, 0) / liveProjects.length) 
    : 0;

  const stats = [
    {
      label: "Active Portfolio",
      value: liveProjects.length,
      change: "+2 this week",
      icon: Zap,
      color: "text-foreground",
      bg: "from-violet-500/10 to-fuchsia-500/5",
      border: "hover:border-violet-500/30"
    },
    {
      label: "Global Velocity",
      value: `${avgProgress}%`,
      change: "On target",
      icon: Activity,
      color: "text-emerald-500",
      bg: "from-emerald-500/10 to-teal-500/5",
      border: "hover:border-emerald-500/30"
    },
    {
      label: "Critical Path",
      value: delayedProjects.length,
      change: "Requires attention",
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "from-rose-500/10 to-orange-500/5",
      border: "hover:border-rose-500/30",
      alert: delayedProjects.length > 0
    },
    {
      label: "Projected Delivery",
      value: "94%",
      change: "Confidence Score",
      icon: Clock,
      color: "text-amber-500",
      bg: "from-amber-500/10 to-yellow-500/5",
      border: "hover:border-amber-500/30"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card 
          key={i} 
          className={cn(
            "glass-card border-border dark:border-white/5 relative overflow-hidden group",
            stat.border
          )}
        >
          {/* Ambient Glow Background */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.bg)} />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 group-hover:scale-110 transition-transform duration-300", stat.color)}>
                <stat.icon size={18} />
              </div>
              {stat.change && (
                <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-1 rounded-full border border-border dark:border-white/5">
                  {stat.change}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-foreground group-hover:translate-x-1 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </div>
            </div>

            {/* Decorative Sparkline/Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/5 dark:bg-white/5">
               <div className={cn("h-full w-2/3 opacity-50", stat.color.replace('text-', 'bg-'))} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};