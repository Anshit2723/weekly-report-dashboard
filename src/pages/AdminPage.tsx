import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Database, Save, FileJson, Server, HardDrive, ShieldAlert, Zap } from 'lucide-react';
import { StorageService } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
import { DeliverablesList } from '@/components/admin/DeliverablesList';
import { initializeFromSampleReport } from '@/services/initializeData';

const AdminPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const { projectCount, deliverableCount } = await initializeFromSampleReport();
      toast({
        title: "Data Loaded",
        description: `Loaded ${projectCount} projects with ${deliverableCount} deliverables from Sample Report.`
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast({ title: "Load Failed", description: "Could not parse Sample Report.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    const data = { projects: StorageService.getProjects(), audit: StorageService.getAuditLogs(), timestamp: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Nexus_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Backup Secure", description: "Archive downloaded." });
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (confirm("CRITICAL WARNING: Overwrite all system data?")) {
          localStorage.setItem('dyad_projects', JSON.stringify(json.projects));
          if (json.audit) localStorage.setItem('dyad_audit', JSON.stringify(json.audit));
          window.location.reload();
        }
      } catch { toast({ title: "Integrity Check Failed", variant: "destructive" }); }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm("CONFIRM SYSTEM PURGE?")) {
      StorageService.clearData();
      window.location.reload();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">System Console</h2>
            <p className="text-muted-foreground">Data initialization, integrity controls, and system maintenance.</p>
          </div>
        </div>

        <Tabs defaultValue="init" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/5 p-1">
            <TabsTrigger value="init" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Initialize</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Maintenance</TabsTrigger>
            <TabsTrigger value="deliverables" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Global Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="init" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card bg-black/40 border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    Load Sample Report
                  </CardTitle>
                  <CardDescription>Initialize dashboard from the embedded Sample Report Excel file.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Database className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      This will parse all sheets (Live, Pipeline, Closed, Deliverables) and populate the dashboard.
                    </p>
                    <Button
                      onClick={handleInitialize}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Initialize from Sample Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-black/40 border-white/5">
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                  <CardDescription>Projects currently in the system.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[240px] space-y-4">
                  {(() => {
                    const projects = StorageService.getProjects();
                    const live = projects.filter(p => p.category === 'Live').length;
                    const pipeline = projects.filter(p => p.category === 'Pipeline').length;
                    const closed = projects.filter(p => p.category === 'Closed').length;
                    return projects.length > 0 ? (
                      <div className="text-center space-y-4">
                        <div className="text-4xl font-bold text-white">{projects.length}</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-widest">Total Projects</div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-emerald-400">{live} Live</span>
                          <span className="text-amber-400">{pipeline} Pipeline</span>
                          <span className="text-zinc-400">{closed} Closed</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground/30 flex flex-col items-center">
                        <HardDrive className="h-12 w-12 mb-2" />
                        <span className="font-mono text-xs">NO_DATA</span>
                        <p className="text-sm text-muted-foreground mt-2">Click "Initialize" to load data</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="glass-card bg-black/40 border-white/5">
                <CardHeader>
                  <CardTitle className="text-base">System Snapshot</CardTitle>
                  <CardDescription>Export full JSON state.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5" onClick={handleBackup}>
                    <Save className="mr-2 h-4 w-4" /> Backup
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card bg-black/40 border-white/5">
                <CardHeader>
                  <CardTitle className="text-base">Disaster Recovery</CardTitle>
                  <CardDescription>Restore state from file.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                      <FileJson className="mr-2 h-4 w-4" /> Restore
                    </Button>
                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleRestore} accept=".json" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-rose-950/10 border-rose-500/20">
                <CardHeader>
                  <CardTitle className="text-base text-rose-500 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" onClick={handleClear} className="w-full justify-start text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                    <RefreshCw className="mr-2 h-4 w-4" /> Purge Database
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deliverables" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="glass-card bg-black/40 border-white/5">
              <CardHeader>
                <CardTitle>Global Asset Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliverablesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminPage;