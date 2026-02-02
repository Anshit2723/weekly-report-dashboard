import React, { useMemo } from 'react';
import { StorageService } from '@/services/storage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

export const DeliverablesList = () => {
  const projects = StorageService.getProjects();

  const allDeliverables = useMemo(() => {
    return projects.flatMap(p => 
      (p.deliverables || []).map(d => ({
        ...d,
        projectName: p.name,
        projectCode: p.proposalCode,
        client: p.client,
        owner: p.owner
      }))
    ).sort((a, b) => {
      // Sort by status (Pending first), then date
      if (a.status !== b.status) return a.status === 'Pending' ? -1 : 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [projects]);

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isValid(date)) return format(date, 'MMM d, yyyy');
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead>Deliverable</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allDeliverables.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No deliverables tracked in the system.
              </TableCell>
            </TableRow>
          ) : (
            allDeliverables.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.status === 'Done' 
                    ? <CheckSquare className="h-4 w-4 text-primary" /> 
                    : <Square className="h-4 w-4 text-muted-foreground" />
                  }
                </TableCell>
                <TableCell className="font-medium">
                  <span className={item.status === 'Done' ? "line-through text-muted-foreground" : ""}>
                    {item.name}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.projectName}
                </TableCell>
                <TableCell>{item.client}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell className="text-sm">
                   {formatDate(item.dueDate)}
                </TableCell>
                <TableCell>
                  {item.status === 'Pending' ? (
                    <Badge variant="secondary" className="font-normal">Pending</Badge>
                  ) : (
                    <Badge variant="outline" className="font-normal text-muted-foreground">Completed</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};