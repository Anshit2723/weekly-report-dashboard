import * as XLSX from 'xlsx';
import { Project, Deliverable } from '@/types/data';

// Column mapping helpers
const getVal = (row: any, keys: string[]): string | null => {
    const rowKeys = Object.keys(row);
    for (const k of keys) {
        const foundKey = rowKeys.find(rk => rk.toLowerCase().includes(k.toLowerCase()));
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
            return row[foundKey];
        }
    }
    return null;
};

const parseExcelDate = (val: any): string | null => {
    if (!val) return null;
    if (val instanceof Date) return val.toLocaleDateString('en-GB');
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toLocaleDateString('en-GB');
    }
    return String(val);
};

const parseProgress = (val: any): number => {
    if (!val) return 0;
    if (typeof val === 'number') {
        return val <= 1 ? Math.round(val * 100) : Math.round(val);
    }
    if (typeof val === 'string') {
        const num = parseFloat(val.replace('%', ''));
        return isNaN(num) ? 0 : Math.round(num <= 1 ? num * 100 : num);
    }
    return 0;
};

const mapStatus = (raw: any): Project['status'] => {
    const s = String(raw || '').toLowerCase();
    if (s.match(/track|live|ongoing|active/)) return 'On Track';
    if (s.match(/delay|late|behind/)) return 'Delayed';
    if (s.match(/critical|risk|blocked/)) return 'Critical';
    if (s.match(/complete|done|closed|finish/)) return 'Completed';
    return 'Not Started';
};

const mapRowToProject = (row: any, category: Project['category']): Project => ({
    id: crypto.randomUUID(),
    proposalCode: String(getVal(row, ['proposal', 'code', 'id', 'sr', 'no']) || `GEN-${Date.now()}`),
    name: String(getVal(row, ['project', 'name', 'title']) || 'Untitled Project'),
    client: String(getVal(row, ['client', 'customer', 'agency', 'organization']) || 'Unknown'),
    owner: String(getVal(row, ['owner', 'lead', 'manager', 'responsible', 'assigned']) || 'Unassigned'),
    startDate: parseExcelDate(getVal(row, ['start', 'kickoff', 'begin'])),
    expectedDeliveryDate: parseExcelDate(getVal(row, ['end', 'delivery', 'deadline', 'due', 'target'])),
    actualDeliveryDate: null,
    status: mapStatus(getVal(row, ['status', 'state', 'stage'])),
    progress: parseProgress(getVal(row, ['progress', '%', 'completion', 'percent'])),
    budget: 0,
    category,
    deliverables: [],
    notes: String(getVal(row, ['notes', 'comments', 'remarks']) || ''),
    lastUpdated: new Date().toISOString()
});

const mapRowToDeliverable = (row: any): { deliverable: Deliverable; proposalCode: string } => {
    const statusRaw = String(getVal(row, ['status', 'state']) || 'Pending').toLowerCase();
    let status: Deliverable['status'] = 'Pending';
    if (statusRaw.match(/progress|ongoing|wip/)) status = 'In Progress';
    if (statusRaw.match(/done|complete|finish/)) status = 'Done';

    return {
        deliverable: {
            id: crypto.randomUUID(),
            name: String(getVal(row, ['deliverable', 'name', 'item', 'task', 'milestone']) || 'Unnamed Deliverable'),
            status,
            dueDate: parseExcelDate(getVal(row, ['due', 'date', 'deadline', 'target'])) || ''
        },
        proposalCode: String(getVal(row, ['proposal', 'project', 'code', 'reference', 'id']) || '')
    };
};

export const initializeFromSampleReport = async (): Promise<{ projectCount: number; deliverableCount: number }> => {
    // Fetch the Excel file from the public directory
    const response = await fetch('/Sample Report.xlsx.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const allProjects: Project[] = [];
    const sheetNames = workbook.SheetNames;

    // Parse Live Projects
    const liveSheet = sheetNames.find(s => s.toLowerCase().includes('live'));
    if (liveSheet) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[liveSheet]);
        data.forEach((row: any) => {
            allProjects.push(mapRowToProject(row, 'Live'));
        });
    }

    // Parse Pipeline sheets (Yet to Start + Upcoming)
    const pipelineSheets = sheetNames.filter(s =>
        s.toLowerCase().includes('yet to') ||
        s.toLowerCase().includes('upcoming') ||
        s.toLowerCase().includes('pipeline')
    );
    pipelineSheets.forEach(sheetName => {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        data.forEach((row: any) => {
            allProjects.push(mapRowToProject(row, 'Pipeline'));
        });
    });

    // Parse Closed Projects
    const closedSheet = sheetNames.find(s => s.toLowerCase().includes('closed'));
    if (closedSheet) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[closedSheet]);
        data.forEach((row: any) => {
            allProjects.push(mapRowToProject(row, 'Closed'));
        });
    }

    // Parse Deliverables and link to projects
    let deliverableCount = 0;
    const deliverableSheet = sheetNames.find(s => s.toLowerCase().includes('deliverable'));
    if (deliverableSheet) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[deliverableSheet]);
        data.forEach((row: any) => {
            const { deliverable, proposalCode } = mapRowToDeliverable(row);
            const project = allProjects.find(p =>
                p.proposalCode.toLowerCase().trim() === proposalCode.toLowerCase().trim()
            );
            if (project) {
                project.deliverables.push(deliverable);
                deliverableCount++;
            }
        });
    }

    // Save to localStorage
    localStorage.setItem('dyad_projects', JSON.stringify(allProjects));
    localStorage.setItem('dyad_audit', JSON.stringify([]));

    return { projectCount: allProjects.length, deliverableCount };
};
