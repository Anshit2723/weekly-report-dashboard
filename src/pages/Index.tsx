import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { ProjectTimeline } from '@/components/dashboard/ProjectTimeline';
import { PortfolioCharts } from '@/components/dashboard/PortfolioCharts';
import { ProjectDetailDrawer } from '@/components/dashboard/ProjectDetailDrawer';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { StorageService } from '@/services/storage';
import { Project } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Plus, List, KanbanSquare, LayoutGrid } from 'lucide-react';
import * as XLSX from 'xlsx';

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);

  const refreshData = () => {
    const data = StorageService.getProjects();
    setProjects(data.filter(p => p.category === 'Live'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(projects);
    XLSX.utils.book_append_sheet(wb, ws, "Live Projects");
    XLSX.writeFile(wb, "Live_Projects_Export.xlsx");
  };

  const handleCreateNew = () => {
    setSelectedProject(null);
    setIsNewProject(true);
    setIsDrawerOpen(true);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsNewProject(false);
    setIsDrawerOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-8 h-full flex flex-col">
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 flex-none border-b border-border dark:border-white/5 pb-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-bold tracking-tight text-foreground dark:text-white dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors">
              Command Center
            </h2>
            <p className="text-muted-foreground font-light tracking-wide">
              Live operational oversight and performance metrics.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleExport} className="border-border dark:border-white/10 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button size="sm" onClick={handleCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 border border-white/10">
              <Plus className="mr-2 h-4 w-4" />
              Initialize Project
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <KPIGrid projects={projects} />
        </div>

        <Tabs defaultValue="list" className="flex-1 flex flex-col space-y-6">
           <div className="flex items-center justify-between flex-none">
                <TabsList className="bg-black/5 dark:bg-black/20 border border-border dark:border-white/5 p-1 h-auto rounded-lg backdrop-blur-md">
                  <TabsTrigger 
                    value="list" 
                    className="gap-2 data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all px-4 py-2"
                  >
                    <List className="h-4 w-4" /> List View
                  </TabsTrigger>
                  <TabsTrigger 
                    value="board" 
                    className="gap-2 data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all px-4 py-2"
                  >
                    <LayoutGrid className="h-4 w-4" /> Kanban Board
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline" 
                    className="gap-2 data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all px-4 py-2"
                  >
                    <KanbanSquare className="h-4 w-4" /> Timeline
                  </TabsTrigger>
                </TabsList>
           </div>

           <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
               <TabsContent value="list" className="mt-0 grid grid-cols-12 gap-6 h-full">
                   <div className="col-span-12 lg:col-span-8 h-full">
                      <ProjectTable projects={projects} onRefresh={refreshData} />
                   </div>
                   <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col">
                      <PortfolioCharts projects={projects} />
                      <div className="flex-1 min-h-[300px]">
                         <RecentActivity />
                      </div>
                   </div>
               </TabsContent>

               <TabsContent value="timeline" className="mt-0 space-y-6">
                   <ProjectTimeline projects={projects} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PortfolioCharts projects={projects} />
                      <RecentActivity />
                   </div>
               </TabsContent>

               <TabsContent value="board" className="mt-0 h-full">
                  <KanbanBoard projects={projects} onProjectClick={handleProjectClick} />
               </TabsContent>
           </div>
        </Tabs>
      </div>

      <ProjectDetailDrawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        project={selectedProject} 
        isNew={isNewProject}
        onSave={refreshData}
      />
    </AppLayout>
  );
};

export default Index;