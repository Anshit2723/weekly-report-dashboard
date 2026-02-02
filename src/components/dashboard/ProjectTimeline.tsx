import React from 'react';
import { Project } from '@/types/data';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { addMonths, differenceInDays, format, isValid, parse, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

export const ProjectTimeline = ({ projects }: { projects: Project[] }) => {
  // 1. Determine timeline bounds
  const today = new Date();
  const validProjects = projects.filter(p => p.startDate && p.expectedDeliveryDate);
  
  if (validProjects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-black/5 dark:bg-white/[0.02] rounded-lg border border-dashed border-border dark:border-white/10">
        No projects with valid dates to display in timeline.
      </div>
    );
  }

  const parseDate = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    if (isValid(date)) return date;
    const parts = d.split('/');
    if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1])-1, Number(parts[0]));
    return null;
  };

  const projectRanges = validProjects.map(p => ({
    ...p,
    start: parseDate(p.startDate) || today,
    end: parseDate(p.expectedDeliveryDate) || addMonths(today, 1)
  })).sort((a,b) => a.start.getTime() - b.start.getTime());

  const earliest = projectRanges.reduce((min, p) => p.start < min ? p.start : min, today);
  const latest = projectRanges.reduce((max, p) => p.end > max ? p.end : max, addMonths(today, 3));
  
  const timelineStart = startOfMonth(addMonths(earliest, -1));
  const timelineEnd = endOfMonth(addMonths(latest, 1));
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  
  const months = eachMonthOfInterval({ start: timelineStart, end: timelineEnd });

  const getLeft = (date: Date) => {
    const diff = differenceInDays(date, timelineStart);
    return `${(diff / totalDays) * 100}%`;
  };

  const getWidth = (start: Date, end: Date) => {
    const diff = differenceInDays(end, start);
    return `${Math.max((diff / totalDays) * 100, 1)}%`;
  };

  return (
    <Card className="glass-card border-border dark:border-white/5 bg-transparent shadow-none">
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border dark:border-white/5 bg-white/50 dark:bg-black/40">
          <div className="min-w-[1000px] p-6 relative">
             {/* Background Grid Pattern */}
             <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Header: Months */}
            <div className="flex border-b border-border dark:border-white/10 pb-4 mb-4 relative h-8 z-10">
              {months.map((month) => {
                const left = getLeft(month);
                return (
                  <div 
                    key={month.toISOString()} 
                    className="absolute text-xs font-bold uppercase tracking-widest text-muted-foreground border-l border-border dark:border-white/10 pl-2 top-0"
                    style={{ left }}
                  >
                    {format(month, 'MMM yyyy')}
                  </div>
                );
              })}
            </div>

            {/* Grid Lines (Vertical) */}
            <div className="absolute inset-0 top-14 pointer-events-none z-0">
               {months.map((month) => (
                  <div 
                    key={`line-${month.toISOString()}`}
                    className="absolute h-full border-l border-dashed border-border dark:border-white/5"
                    style={{ left: getLeft(month) }}
                  />
               ))}
               {/* Today Marker */}
               <div 
                  className="absolute h-full border-l-2 border-primary z-20 shadow-[0_0_10px_#6d28d9]"
                  style={{ left: getLeft(today) }}
               >
                 <div className="absolute -top-1.5 -left-[5px] w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#6d28d9]" />
                 <div className="absolute top-2 left-2 text-[10px] font-bold text-primary bg-background/80 px-1 rounded backdrop-blur">TODAY</div>
               </div>
            </div>

            {/* Project Bars */}
            <div className="space-y-4 relative z-10 pt-2">
              {projectRanges.map((project) => {
                const isDelayed = project.status === 'Delayed' || project.status === 'Critical';
                // Neon gradients
                const barClass = isDelayed 
                  ? "bg-gradient-to-r from-orange-500 to-amber-400 shadow-md" 
                  : "bg-gradient-to-r from-violet-600 to-indigo-500 shadow-md";
                
                return (
                  <div key={project.id} className="relative h-12 flex items-center group">
                    <div className="w-[220px] sticky left-0 z-30 bg-background/95 backdrop-blur border-r border-border dark:border-white/10 pr-6 flex flex-col justify-center shadow-lg">
                      <span className="text-sm font-semibold text-foreground dark:text-zinc-100 truncate group-hover:text-primary transition-colors">{project.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{project.client}</span>
                    </div>
                    
                    <div className="flex-1 relative h-full flex items-center">
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                             <div 
                                className={cn(
                                  "absolute h-3 rounded-full cursor-pointer transition-all hover:brightness-125 hover:h-4",
                                  barClass
                                )}
                                style={{ 
                                  left: getLeft(project.start), 
                                  width: getWidth(project.start, project.end) 
                                }}
                              >
                                {project.progress > 5 && (
                                   <div className="h-full bg-white/20 rounded-full" style={{ width: `${project.progress}%` }} />
                                )}
                              </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white/90 dark:bg-black/90 border-border dark:border-white/10 backdrop-blur-xl text-xs">
                            <p className="font-bold text-foreground dark:text-white mb-1">{project.name}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground dark:text-zinc-400">
                               <span>Start:</span> <span className="text-right text-foreground dark:text-zinc-200">{format(project.start, 'MMM d')}</span>
                               <span>End:</span> <span className="text-right text-foreground dark:text-zinc-200">{format(project.end, 'MMM d')}</span>
                               <span>Progress:</span> <span className="text-right text-primary font-bold">{project.progress}%</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" className="bg-black/5 dark:bg-white/5" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};