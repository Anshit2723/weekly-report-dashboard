import React, { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CalendarClock, AlertTriangle, CheckCircle2, Radar } from 'lucide-react';
import { StorageService } from '@/services/storage';
import { Project } from '@/types/data';
import { differenceInDays, parse, isValid, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const NotificationsPopover = () => {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<{ id: string; title: string; type: 'warning' | 'info' | 'urgent'; message: string; project: Project }[]>([]);
  const navigate = useNavigate();

  const parseDate = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    if (isValid(date)) return date;
    const parts = d.split('/');
    if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1])-1, Number(parts[0]));
    return null;
  };

  useEffect(() => {
    const checkAlerts = () => {
      const projects = StorageService.getProjects().filter(p => 
        p.category === 'Live' || p.category === 'SOW'
      );
      const newAlerts: typeof alerts = [];
      const today = new Date();

      projects.forEach(p => {
        const endDate = parseDate(p.expectedDeliveryDate);
        if (endDate) {
          const daysLeft = differenceInDays(endDate, today);
          
          if (daysLeft < 0 && p.status !== 'Completed') {
            newAlerts.push({
              id: `overdue-${p.id}`,
              title: "DEADLINE BREACHED",
              type: "urgent",
              message: `${p.name} is ${Math.abs(daysLeft)} days overdue.`,
              project: p
            });
          } else if (daysLeft >= 0 && daysLeft <= 7 && p.status !== 'Completed') {
            newAlerts.push({
              id: `due-soon-${p.id}`,
              title: "IMMINENT DEADLINE",
              type: "warning",
              message: `${p.name} due in ${daysLeft} days.`,
              project: p
            });
          }
        }

        if (p.status === 'Critical') {
             newAlerts.push({
              id: `crit-${p.id}`,
              title: "CRITICAL STATUS",
              type: "urgent",
              message: `${p.name} requires immediate intervention.`,
              project: p
            });
        }
      });

      setAlerts(newAlerts.sort((a,b) => (a.type === 'urgent' ? -1 : 1)));
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (project: Project) => {
    setOpen(false);
    navigate('/');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-white/5 transition-colors">
          <Bell className={cn("h-5 w-5 text-zinc-400", alerts.length > 0 && "text-white animate-pulse")} />
          {alerts.length > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] border border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 bg-black/90 border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
             <Radar className="h-4 w-4 text-primary animate-[spin_4s_linear_infinite]" />
             <h4 className="font-semibold text-sm tracking-wide">System Alerts</h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-muted-foreground">
             {alerts.length} ACTIVE
          </span>
        </div>
        <ScrollArea className="h-[320px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground/30">
              <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-xs font-mono uppercase tracking-widest">Systems Nominal</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {alerts.map((alert) => (
                <div 
                   key={alert.id} 
                   className={cn(
                     "p-4 cursor-pointer transition-all hover:bg-white/5 border-l-2",
                     alert.type === 'urgent' ? "border-l-rose-500 bg-rose-950/10" : "border-l-amber-500 bg-amber-950/10"
                   )}
                   onClick={() => handleClick(alert.project)}
                >
                  <div className="flex items-start gap-3">
                    {alert.type === 'urgent' ? (
                      <AlertTriangle className="h-4 w-4 text-rose-500 mt-1 shrink-0" />
                    ) : (
                      <CalendarClock className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                    )}
                    <div>
                      <h5 className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        alert.type === 'urgent' ? "text-rose-400" : "text-amber-400"
                      )}>
                        {alert.title}
                      </h5>
                      <p className="text-sm text-zinc-300 mt-1 leading-snug">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] text-zinc-500 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                            ID: {alert.project.proposalCode}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};