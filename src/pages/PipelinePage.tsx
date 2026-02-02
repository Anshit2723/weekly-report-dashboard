import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { ProjectDetailDrawer } from '@/components/dashboard/ProjectDetailDrawer';
import { StorageService } from '@/services/storage';
import { Project } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Plus, Download, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';

const PipelinePage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refreshData = () => {
    const data = StorageService.getProjects();
    // Show Pipeline or SOW projects
    setProjects(data.filter(p => p.category === 'Pipeline' || p.category === 'SOW'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(projects);
    XLSX.utils.book_append_sheet(wb, ws, "Pipeline Projects");
    XLSX.writeFile(wb, "Pipeline_Export.xlsx");
  };

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Opportunity Pipeline</h2>
            <p className="text-zinc-400 font-light tracking-wide">Tracking potential revenue and strategic initiatives.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} className="border-white/10 bg-transparent hover:bg-white/5 hover:text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => setIsDrawerOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
           <Card className="glass-card bg-emerald-950/10 border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Total Value
                 </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    ${totalBudget.toLocaleString()}
                </div>
                <p className="text-xs text-emerald-400/60 mt-1">Estimated revenue potential</p>
              </CardContent>
           </Card>

           <Card className="glass-card border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" /> Active Deals
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-3xl font-bold text-white">{projects.length}</div>
                 <p className="text-xs text-muted-foreground mt-1">Opportunities in funnel</p>
              </CardContent>
           </Card>

           <Card className="glass-card border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Avg. Deal Size
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-3xl font-bold text-white">
                    ${projects.length ? Math.round(totalBudget / projects.length).toLocaleString() : 0}
                 </div>
                 <p className="text-xs text-muted-foreground mt-1">Per opportunity average</p>
              </CardContent>
           </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           <ProjectTable projects={projects} onRefresh={refreshData} />
        </div>
      </div>

      <ProjectDetailDrawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        project={null} 
        isNew={true}
        onSave={refreshData}
      />
    </AppLayout>
  );
};

export default PipelinePage;