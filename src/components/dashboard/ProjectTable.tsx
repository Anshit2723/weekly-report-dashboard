import React, { useState, useMemo } from 'react';
import { Project } from '@/types/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Trash2, 
  Archive as ArchiveIcon,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Eye,
  CalendarRange
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ProjectDetailDrawer } from './ProjectDetailDrawer';
import { StorageService } from '@/services/storage';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProjectTableProps {
  projects: Project[];
  onRefresh?: () => void;
}

// Custom Status Badge with Glow
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'On Track': "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    'Delayed': "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    'Critical': "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
    'Completed': "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    'Not Started': "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  };

  return (
    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all", styles[status] || styles['Not Started'])}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-2", status === 'Not Started' ? 'bg-zinc-400' : 'animate-pulse', styles[status]?.replace('text-', 'bg-').split(' ')[1])} />
      {status}
    </div>
  );
};

export const ProjectTable = ({ projects, onRefresh }: ProjectTableProps) => {
  const { currentUser } = useUser();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof Project) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.client.toLowerCase().includes(lower) ||
        p.proposalCode.toLowerCase().includes(lower) ||
        (p.owner && p.owner.toLowerCase().includes(lower))
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter(p => statusFilter.includes(p.status));
    }
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [projects, searchTerm, statusFilter, sortConfig]);

  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  const handleArchive = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (confirm(`Archive "${project.name}"?`)) {
      const updated = { ...project, category: 'Archive' as const };
      StorageService.updateProject(updated, currentUser.name);
      toast.success("Archived");
      onRefresh?.();
    }
  };

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (confirm(`Delete "${project.name}" permanently?`)) {
      StorageService.deleteProject(project.id, currentUser.name);
      toast.success("Deleted");
      onRefresh?.();
    }
  };

  const SortIcon = ({ column }: { column: keyof Project }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-3 w-3 text-primary" /> : <ArrowDown className="ml-2 h-3 w-3 text-primary" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search projects by name, code, or client..." 
            className="pl-10 bg-white/50 dark:bg-black/20 border-border dark:border-white/5 focus:border-primary/50 transition-all rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 border-dashed border-border hover:border-primary/50 bg-transparent gap-2">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
                {statusFilter.length > 0 && (
                   <span className="ml-1 rounded-full bg-primary text-white w-5 h-5 text-[10px] flex items-center justify-center font-bold">
                     {statusFilter.length}
                   </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/90 dark:bg-black/90 border-border dark:border-white/10 backdrop-blur-xl">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border dark:bg-white/10" />
              {['On Track', 'Delayed', 'Critical', 'Completed', 'Not Started'].map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => setStatusFilter(prev => checked ? [...prev, status] : prev.filter(s => s !== status))}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              {statusFilter.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-border dark:bg-white/10" />
                  <DropdownMenuItem onClick={() => setStatusFilter([])} className="justify-center text-xs text-muted-foreground">
                    Clear
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-xl border border-border dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border dark:border-white/5">
              <TableHead className="text-xs uppercase tracking-widest font-bold text-muted-foreground pl-6 h-12">Project</TableHead>
              <TableHead className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Client</TableHead>
              <TableHead className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Owner</TableHead>
              <TableHead className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-widest font-bold text-muted-foreground text-right">Completion</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No projects match your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProjects.map((project) => (
                <TableRow 
                  key={project.id} 
                  className="group hover:bg-black/5 dark:hover:bg-white/[0.02] border-border dark:border-white/5 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(project)}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{project.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{project.proposalCode}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{project.client}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 border border-border dark:border-white/10 flex items-center justify-center text-[9px] font-bold text-foreground">
                        {project.owner ? project.owner.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}
                      </div>
                      <span className="text-xs text-muted-foreground">{project.owner || 'Unassigned'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <span className="font-mono text-sm font-medium">{project.progress}%</span>
                       <div className="w-16 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-primary shadow-[0_0_8px_rgba(109,40,217,0.5)]" 
                             style={{ width: `${project.progress}%` }} 
                          />
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/90 dark:bg-black/90 border-border dark:border-white/10 backdrop-blur-xl">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(project); }}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {project.category !== 'Archive' && (
                          <DropdownMenuItem onClick={(e) => handleArchive(e, project)}>
                            <ArchiveIcon className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border dark:bg-white/10" />
                        <DropdownMenuItem onClick={(e) => handleDelete(e, project)} className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectDetailDrawer 
        project={selectedProject}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={() => {
          setDrawerOpen(false);
          onRefresh?.();
        }}
      />
    </div>
  );
};