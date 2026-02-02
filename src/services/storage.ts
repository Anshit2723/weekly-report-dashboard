import { Project, AuditLog } from '@/types/data';

const STORAGE_KEYS = {
  PROJECTS: 'dyad_projects',
  AUDIT: 'dyad_audit',
  SETTINGS: 'dyad_settings'
};

export const StorageService = {
  getProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  },

  saveProjects: (projects: Project[]) => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  createProject: (project: Project, user: string = 'Admin User') => {
    const projects = StorageService.getProjects();
    const newProject = { 
      ...project, 
      lastUpdated: new Date().toISOString() 
    };
    
    StorageService.saveProjects([newProject, ...projects]);
    
    StorageService.addAuditLog({
      user,
      action: 'CREATE',
      entityType: 'PROJECT',
      entityId: project.proposalCode,
      details: `Created new project: ${project.name}`
    });
  },

  updateProject: (updatedProject: Project, user: string = 'Admin User') => {
    const projects = StorageService.getProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    
    if (index === -1) return;

    const oldProject = projects[index];
    const changes: string[] = [];

    // Simple diffing for audit log
    (Object.keys(updatedProject) as Array<keyof Project>).forEach(key => {
      const k = key as keyof Project;
      // Simple equality check
      if (JSON.stringify(updatedProject[k]) !== JSON.stringify(oldProject[k])) {
        changes.push(`${k}: ${oldProject[k]} -> ${updatedProject[k]}`);
      }
    });

    if (changes.length === 0) return;

    const newProject = { ...updatedProject, lastUpdated: new Date().toISOString() };
    projects[index] = newProject;
    
    StorageService.saveProjects(projects);
    
    StorageService.addAuditLog({
      user,
      action: 'UPDATE',
      entityType: 'PROJECT',
      entityId: updatedProject.proposalCode,
      details: JSON.stringify(changes)
    });
  },
  
  deleteProject: (id: string, user: string = 'Admin User') => {
    const projects = StorageService.getProjects();
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    const filtered = projects.filter(p => p.id !== id);
    StorageService.saveProjects(filtered);
    
    StorageService.addAuditLog({
      user,
      action: 'DELETE',
      entityType: 'PROJECT',
      entityId: project.proposalCode,
      details: 'Project deleted permanently'
    });
  },

  getAuditLogs: (): AuditLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return data ? JSON.parse(data) : [];
  },

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify([newLog, ...logs]));
  },

  clearData: () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
  },

  // Seed with dummy data if empty
  seedInitialData: () => {
    if (StorageService.getProjects().length > 0) return;
    
    const dummyProjects: Project[] = [
      {
        id: crypto.randomUUID(),
        proposalCode: 'P-2024-001',
        name: 'Enterprise Dashboard Revamp',
        client: 'Acme Corp',
        owner: 'Sarah Chen',
        startDate: '2024-01-15',
        expectedDeliveryDate: '2024-04-30',
        actualDeliveryDate: null,
        status: 'On Track',
        progress: 65,
        budget: 150000,
        category: 'Live',
        deliverables: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        proposalCode: 'P-2024-002',
        name: 'Mobile App Migration',
        client: 'Globex Inc',
        owner: 'Mike Ross',
        startDate: '2024-02-01',
        expectedDeliveryDate: '2024-05-15',
        actualDeliveryDate: null,
        status: 'Delayed',
        progress: 40,
        budget: 85000,
        category: 'Live',
        deliverables: [],
        lastUpdated: new Date().toISOString()
      }
    ];
    
    StorageService.saveProjects(dummyProjects);
    StorageService.addAuditLog({
      user: 'System',
      action: 'SEED',
      entityType: 'PROJECT',
      entityId: 'BATCH',
      details: 'Initial dummy data seed'
    });
  }
};