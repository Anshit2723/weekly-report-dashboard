import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Project, AuditLog, Deliverable } from '@/types/data';
import { StorageService } from '@/services/storage';
import { useUser } from '@/contexts/UserContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Plus, Trash2, CheckSquare, Square, DollarSign, Calendar, User, Briefcase, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectDetailDrawerProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  isNew?: boolean;
}

export const ProjectDetailDrawer = ({ project, open, onClose, onSave, isNew = false }: ProjectDetailDrawerProps) => {
  const { currentUser } = useUser();
  const [formData, setFormData] = React.useState<Project | null>(null);
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [newDeliverable, setNewDeliverable] = React.useState('');

  React.useEffect(() => {
    if (open) {
      if (project) {
        setFormData({ ...project });
        const allLogs = StorageService.getAuditLogs();
        const projectLogs = allLogs.filter(l => l.entityId === project.proposalCode);
        setLogs(projectLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else if (isNew) {
        setFormData({
          id: crypto.randomUUID(),
          proposalCode: `NEW-${Math.floor(Math.random() * 10000)}`,
          name: '',
          client: '',
          owner: '',
          startDate: null,
          expectedDeliveryDate: null,
          actualDeliveryDate: null,
          status: 'Not Started',
          progress: 0,
          budget: 0,
          category: 'Live',
          deliverables: [],
          notes: '',
          lastUpdated: new Date().toISOString()
        });
        setLogs([]);
      }
    }
  }, [project, open, isNew]);

  const handleChange = (field: keyof Project, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const addDeliverable = () => {
    if (!formData || !newDeliverable.trim()) return;
    const newItem: Deliverable = {
      id: crypto.randomUUID(),
      name: newDeliverable,
      status: 'Pending',
      dueDate: new Date().toISOString() 
    };
    setFormData({
      ...formData,
      deliverables: [...(formData.deliverables || []), newItem]
    });
    setNewDeliverable('');
  };

  const toggleDeliverable = (id: string) => {
    if (!formData) return;
    const updated = (formData.deliverables || []).map(d => 
      d.id === id ? { ...d, status: d.status === 'Done' ? 'Pending' : 'Done' } : d
    );
    setFormData({ ...formData, deliverables: updated as Deliverable[] });
  };

  const removeDeliverable = (id: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter(d => d.id !== id)
    });
  };

  const handleSave = () => {
    if (formData) {
      if (isNew) {
        StorageService.createProject(formData, currentUser.name);
      } else {
        StorageService.updateProject(formData, currentUser.name);
      }
      onSave();
      onClose();
    }
  };

  if (!formData) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-2xl w-[900px] border-l border-border dark:border-white/10 bg-background/95 dark:bg-background/80 backdrop-blur-xl p-0 flex flex-col shadow-2xl">
        {/* Header with Gradient */}
        <div className="relative h-32 bg-gradient-to-br from-primary/10 via-background to-background p-6 flex flex-col justify-end border-b border-border dark:border-white/5">
          <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground bg-black/5 dark:bg-black/20 px-2 py-1 rounded border border-border dark:border-white/5">
            ID: {formData.proposalCode}
          </div>
          <SheetTitle className="text-3xl font-bold tracking-tight text-foreground mb-1">
            {isNew ? "Initialize Project" : formData.name}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              formData.status === 'On Track' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : 
              formData.status === 'Delayed' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
              formData.status === 'Critical' ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-zinc-500"
            )} />
            {formData.client || "No Client Selected"}
          </SheetDescription>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="details" className="flex-1 flex flex-col">
            <div className="px-6 py-2 border-b border-border dark:border-white/5 bg-black/5 dark:bg-black/20">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                {['Details', 'Notes', 'Deliverables', 'History'].map(tab => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab.toLowerCase()}
                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="details" className="mt-0 space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="grid gap-6">
                     <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Project Name</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            value={formData.name} 
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="pl-10 bg-black/5 dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50 text-lg"
                            placeholder="Project Title"
                          />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Client Organization</Label>
                        <Input 
                          value={formData.client} 
                          onChange={(e) => handleChange('client', e.target.value)}
                          className="bg-black/5 dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Lead Owner</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            value={formData.owner} 
                            onChange={(e) => handleChange('owner', e.target.value)}
                            className="pl-10 bg-black/5 dark:bg-white/5 border-border dark:border-white/10 focus:border-primary/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-border dark:border-white/5 bg-black/5 dark:bg-white/[0.02] grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(v) => handleChange('status', v)}
                        >
                          <SelectTrigger className="bg-background dark:bg-black/20 border-border dark:border-white/10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 dark:bg-black/90 border-border dark:border-white/10 backdrop-blur-xl">
                            <SelectItem value="On Track">On Track</SelectItem>
                            <SelectItem value="Delayed">Delayed</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Progress</Label>
                        <div className="flex items-center gap-4">
                           <Input 
                              type="number" 
                              min="0" max="100"
                              value={formData.progress} 
                              onChange={(e) => handleChange('progress', Number(e.target.value))}
                              className="bg-background dark:bg-black/20 border-border dark:border-white/10 w-24"
                            />
                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-primary transition-all duration-500" style={{ width: `${formData.progress}%` }} />
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Budget Allocation</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
                          <Input 
                            type="number" 
                            className="pl-10 bg-black/5 dark:bg-white/5 border-border dark:border-white/10 focus:border-emerald-500/50"
                            value={formData.budget} 
                            onChange={(e) => handleChange('budget', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Pipeline Stage</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(v) => handleChange('category', v)}
                        >
                          <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border dark:border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 dark:bg-black/90 border-border dark:border-white/10 backdrop-blur-xl">
                            <SelectItem value="Live">Live Execution</SelectItem>
                            <SelectItem value="Pipeline">Pipeline Opportunity</SelectItem>
                            <SelectItem value="SOW">SOW Generation</SelectItem>
                            <SelectItem value="Closed">Closed / Won</SelectItem>
                            <SelectItem value="Archive">Archive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Start Date</Label>
                        <div className="relative">
                           <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Input 
                            value={formData.startDate || ''} 
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className="pl-10 bg-black/5 dark:bg-white/5 border-border dark:border-white/10"
                            placeholder="DD/MM/YYYY"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">Target Delivery</Label>
                        <div className="relative">
                           <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Input 
                            value={formData.expectedDeliveryDate || ''} 
                            onChange={(e) => handleChange('expectedDeliveryDate', e.target.value)}
                            className="pl-10 bg-black/5 dark:bg-white/5 border-border dark:border-white/10"
                            placeholder="DD/MM/YYYY"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border dark:border-white/5">
                        <Label className="text-xs uppercase tracking-widest text-muted-foreground">System Reference ID</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            value={formData.proposalCode} 
                            onChange={(e) => handleChange('proposalCode', e.target.value)}
                            className="pl-10 bg-black/5 dark:bg-black/40 border-border dark:border-white/5 font-mono text-xs text-muted-foreground"
                          />
                        </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-0 h-full animate-in slide-in-from-bottom-2 duration-500">
                   <div className="space-y-4 h-full flex flex-col">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Field Notes</Label>
                      <Textarea 
                         className="flex-1 min-h-[400px] font-mono text-sm bg-black/5 dark:bg-black/20 border-border dark:border-white/10 focus:border-primary/50 resize-none p-4 leading-relaxed"
                         placeholder="// Enter meeting minutes, technical specifications, or status updates..."
                         value={formData.notes || ''}
                         onChange={(e) => handleChange('notes', e.target.value)}
                      />
                   </div>
                </TabsContent>

                <TabsContent value="deliverables" className="mt-0 space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                   <div className="flex gap-2 mb-4">
                      <Input 
                        placeholder="Add new deliverable..." 
                        value={newDeliverable}
                        onChange={(e) => setNewDeliverable(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addDeliverable()}
                        className="bg-black/5 dark:bg-white/5 border-border dark:border-white/10"
                      />
                      <Button onClick={addDeliverable} size="icon" className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4" /></Button>
                   </div>
                   
                   <div className="space-y-2">
                      {(!formData.deliverables || formData.deliverables.length === 0) && (
                         <div className="text-center text-muted-foreground py-12 border border-dashed border-border dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/[0.02]">
                            No deliverables configured.
                         </div>
                      )}
                      {formData.deliverables?.map((d) => (
                         <div key={d.id} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/[0.03] border border-border dark:border-white/5 rounded-lg group hover:bg-black/10 dark:hover:bg-white/[0.05] transition-colors">
                            <div className="flex items-center gap-3">
                               <button 
                                  onClick={() => toggleDeliverable(d.id)} 
                                  className={cn("transition-colors", d.status === 'Done' ? "text-emerald-500" : "text-muted-foreground hover:text-foreground")}
                               >
                                  {d.status === 'Done' ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                               </button>
                               <span className={cn("text-sm", d.status === 'Done' ? "line-through text-muted-foreground" : "text-foreground dark:text-zinc-200")}>
                                  {d.name}
                               </span>
                            </div>
                            <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-8 w-8 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                               onClick={() => removeDeliverable(d.id)}
                            >
                               <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      ))}
                   </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-0">
                  <div className="space-y-6 pl-2 relative border-l border-border dark:border-white/10 ml-2">
                    {logs.length === 0 ? (
                      <p className="text-sm text-muted-foreground pl-4">No recorded history.</p>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="relative pl-6">
                          <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-background dark:bg-black border border-border dark:border-white/20" />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-foreground dark:text-zinc-200">{log.user}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400/80 bg-emerald-500/10 dark:bg-emerald-500/5 p-2 rounded border border-emerald-500/20 dark:border-emerald-500/10 mt-1">
                              {log.details}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
        
        <SheetFooter className="p-6 border-t border-border dark:border-white/5 bg-background/95 dark:bg-black/40 backdrop-blur-sm">
           <Button variant="ghost" onClick={onClose} className="hover:bg-black/5 dark:hover:bg-white/5">Cancel</Button>
           <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px] shadow-[0_0_15px_rgba(109,40,217,0.3)]">
             {isNew ? "Initialize Project" : "Save Changes"}
           </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};