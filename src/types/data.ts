export type ProjectStatus = 'On Track' | 'Delayed' | 'Critical' | 'Completed' | 'Not Started';

export interface Project {
  id: string; // Internal UUID
  proposalCode: string; // The "Proposal Code" from Excel (Primary Key)
  name: string;
  client: string;
  owner: string;
  startDate: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  status: ProjectStatus;
  progress: number;
  budget: number;
  category: 'Live' | 'Pipeline' | 'SOW' | 'Closed' | 'Archive';
  description?: string;
  notes?: string; // Free-form notes
  deliverables: Deliverable[];
  lastUpdated: string;
}

export interface Deliverable {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Done';
  dueDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SEED' | 'RECONCILE';
  entityType: 'PROJECT';
  entityId: string;
  details: string; // JSON string of changes
}

export interface SheetMapping {
  excelColumn: string;
  dbField: keyof Project;
  required: boolean;
}