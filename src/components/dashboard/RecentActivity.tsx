import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StorageService } from '@/services/storage';
import { AuditLog } from '@/types/data';
import { formatDistanceToNow } from 'date-fns';
import { Activity, PlusCircle, Edit2, Trash2, Database, FileSpreadsheet, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RecentActivity = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const allLogs = StorageService.getAuditLogs();
    setLogs(allLogs.slice(0, 20));
  }, []);

  return (
    <Card className="h-full glass-card border-border dark:border-white/5 shadow-none flex flex-col">
      <CardHeader className="pb-3 border-b border-border dark:border-white/5">
        <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          System Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-[500px] w-full">
          <div className="p-4 space-y-5">
            {logs.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50">
                 <Terminal className="h-8 w-8 mb-2 opacity-20" />
                 <p className="text-xs font-mono">NO_DATA_STREAM</p>
               </div>
            ) : (
               logs.map((log, index) => (
                <div key={log.id} className="relative pl-6 group animate-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Tech line */}
                  <div className="absolute left-[4.5px] top-2 bottom-[-24px] w-px bg-gradient-to-b from-border dark:from-white/10 to-transparent group-last:hidden" />
                  
                  {/* Glowing Dot */}
                  <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-background border border-border dark:border-white/10 flex items-center justify-center z-10 shadow-sm dark:shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover:border-primary/50 transition-colors">
                     <div className="w-1 h-1 rounded-full bg-muted-foreground/20 dark:bg-white/20 group-hover:bg-primary transition-colors" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground dark:text-zinc-300 font-mono tracking-tight group-hover:text-primary dark:group-hover:text-white transition-colors">
                          {log.user}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-border dark:border-white/5 text-[9px] font-mono text-muted-foreground uppercase">
                           {log.action}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground dark:text-zinc-400 leading-relaxed font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      {log.details.length > 80 ? log.details.substring(0, 80) + '...' : log.details}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[9px] text-primary/70 font-mono flex items-center gap-1">
                         ID: {log.entityId.substring(0, 8)}...
                       </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};