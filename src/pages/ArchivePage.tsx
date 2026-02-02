import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { StorageService } from '@/services/storage';
import { Project } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ArchivePage = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const refreshData = () => {
    const data = StorageService.getProjects();
    setProjects(data.filter(p => p.category === 'Archive' || p.category === 'Closed'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(projects);
    XLSX.utils.book_append_sheet(wb, ws, "Archived Projects");
    XLSX.writeFile(wb, "Archive_Export.xlsx");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div>
             <h2 className="text-3xl font-bold tracking-tight">Project Archive</h2>
             <p className="text-muted-foreground">Historical records of closed and completed projects.</p>
           </div>
           <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
           </Button>
        </div>
        <ProjectTable projects={projects} onRefresh={refreshData} />
      </div>
    </AppLayout>
  );
};

export default ArchivePage;