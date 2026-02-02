import React from 'react';
import { Project } from '@/types/data';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const STATUS_CONFIG = {
  'Not Started': { 
    color: 'bg-zinc-500', 
    bar: 'bg-zinc-500',
    header: 'border-zinc-500/20' 
  },
  'On Track': { 
    color: 'bg-emerald-500', 
    bar: 'bg-emerald-500',
    header: 'border-emerald-500/20' 
  },
  'Delayed': { 
    color: 'bg-amber-500', 
    bar: 'bg-amber-500',
    header: 'border-amber-500/20' 
  },
  'Critical': { 
    color: 'bg-rose-500', 
    bar: 'bg-rose-500',
    header: 'border-rose-500/20' 
  },
  'Completed': { 
    color: 'bg-blue-500', 
    bar: 'bg-blue-500',
    header: 'border-blue-500/20' 
  },
};

export const KanbanBoard = ({ projects, onProjectClick }: KanbanBoardProps) => {
  const columns = Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>;

  return (
    <div className="h-[calc(100vh-240px)] flex gap-6 overflow-x-auto pb-6 snap-x pt-2">
      {columns.map((status) => {
        const columnProjects = projects.filter(p => p.status === status);
        const config = STATUS_CONFIG[status];
        
        return (
          <div key={status} className="min-w-[320px] flex flex-col h-full rounded-xl bg-black/5 dark:bg-white/[0.02] border border-border dark:border-white/5 backdrop-blur-sm snap-start">
            {/* Column Header */}
            <div className={cn("p-4 border-b border-border dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/[0.02]", config.header)}>
              <div className="flex items-center gap-2">
                 <div className={cn("w-2 h-2 rounded-full shadow-sm", config.color.replace('bg-', 'text-'))} />
                 <h3 className="font-medium text-sm tracking-wide text-foreground dark:text-zinc-200">{status}</h3>
              </div>
              <Badge variant="outline" className="text-xs bg-white/50 dark:bg-black/20 border-border dark:border-white/10 text-muted-foreground font-mono">
                {columnProjects.length}
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 p-3">
              <div className="flex flex-col gap-3">
                {columnProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer border-border dark:border-white/5 bg-white dark:bg-black/40 hover:bg-white/80 dark:hover:bg-white/5 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden shadow-sm dark:shadow-none"
                    onClick={() => onProjectClick(project)}
                  >
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-60 group-hover:opacity-100 transition-opacity", config.bar)} />
                    
                    <CardContent className="p-4 space-y-3 pl-5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                           <span className="font-semibold text-sm leading-tight text-foreground dark:text-zinc-200 group-hover:text-primary dark:group-hover:text-white transition-colors line-clamp-2">
                             {project.name}
                           </span>
                           {project.status === 'Critical' && (
                             <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 animate-pulse" />
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-mono opacity-70">
                          {project.client}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end pt-2">
                        <div className="flex items-center text-[10px] text-muted-foreground gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
                          <Calendar className="h-3 w-3" />
                          {project.expectedDeliveryDate ? project.expectedDeliveryDate.slice(0, 5) : '--/--'}
                        </div>
                        
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono text-primary font-bold">{project.progress}%</span>
                           <Avatar className="h-5 w-5 border border-border dark:border-white/10">
                            <AvatarFallback className="text-[8px] bg-muted dark:bg-zinc-800 text-muted-foreground dark:text-zinc-400">
                              {project.owner ? project.owner.slice(0,2).toUpperCase() : '??'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};