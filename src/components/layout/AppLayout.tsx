import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard, 
  Briefcase, 
  Archive, 
  Settings, 
  Search,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Sun,
  Moon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CommandPalette } from './CommandPalette';
import { NotificationsPopover } from './NotificationsPopover';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }: { icon: any, label: string, path: string, active: boolean, collapsed: boolean }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "relative group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300 ease-out",
        active 
          ? "text-primary-foreground bg-primary shadow-[0_0_15px_rgba(109,40,217,0.3)]" 
          : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
        collapsed && "justify-center px-2"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white dark:bg-primary rounded-r-full shadow-[0_0_10px_currentColor]" />
      )}
      <Icon size={20} className={cn("shrink-0 transition-transform duration-300", active && "scale-110")} />
      {!collapsed && (
        <span className="text-sm font-medium tracking-wide animate-in fade-in slide-in-from-left-2 duration-300">
          {label}
        </span>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-popover border border-border rounded text-xs text-popover-foreground opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap shadow-xl">
          {label}
        </div>
      )}
    </button>
  );
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, updateUser } = useUser();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempRole, setTempRole] = useState('');
  const [tempInitials, setTempInitials] = useState('');

  const openProfile = () => {
    setTempName(currentUser.name);
    setTempRole(currentUser.role);
    setTempInitials(currentUser.initials);
    setIsProfileOpen(true);
  };

  const saveProfile = () => {
    updateUser({
      name: tempName,
      role: tempRole,
      initials: tempInitials
    });
    setIsProfileOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'luxury' ? 'modern' : 'luxury');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/20">
      <CommandPalette />
      
      {/* Cinematic Sidebar */}
      <aside className={cn(
        "relative z-30 h-screen flex flex-col border-r border-border bg-white/50 dark:bg-black/20 backdrop-blur-xl transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)",
        sidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="h-20 flex items-center px-6 gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-900 shadow-lg shadow-primary/20 shrink-0">
             <Hexagon className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
             <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground animate-in fade-in duration-500">
               NEXUS
             </span>
          )}
        </div>

        <div className="px-4 py-6 space-y-8 flex-1">
          <div className="space-y-2">
            <div className={cn("px-2 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-2", !sidebarOpen && "text-center")}>
              {sidebarOpen ? "Platform" : "•"}
            </div>
            <SidebarItem icon={LayoutDashboard} label="Overview" path="/" active={location.pathname === '/'} collapsed={!sidebarOpen} />
            <SidebarItem icon={Briefcase} label="Pipeline" path="/pipeline" active={location.pathname === '/pipeline'} collapsed={!sidebarOpen} />
            <SidebarItem icon={Archive} label="Archive" path="/archive" active={location.pathname === '/archive'} collapsed={!sidebarOpen} />
          </div>

          <div className="space-y-2">
            <div className={cn("px-2 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-2", !sidebarOpen && "text-center")}>
              {sidebarOpen ? "System" : "•"}
            </div>
            <SidebarItem icon={Settings} label="Administration" path="/admin" active={location.pathname === '/admin'} collapsed={!sidebarOpen} />
          </div>
        </div>

        {/* User Profile Strip */}
        <div className="p-4 border-t border-border">
          <button 
            onClick={openProfile}
            className={cn(
              "flex items-center gap-3 w-full p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 group",
              !sidebarOpen && "justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 border border-border flex items-center justify-center text-xs font-bold text-foreground shadow-inner group-hover:border-primary/50 transition-colors">
              {currentUser.initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{currentUser.role}</p>
              </div>
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-lg z-50"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100/50 via-background to-background dark:from-zinc-900/50">
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm bg-background/0">
           {/* Omni-search trigger */}
           <div 
              className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-border/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer w-64 md:w-96 shadow-sm"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Search anything...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                 ⌘K
              </kbd>
           </div>

           <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                {theme === 'luxury' ? (
                  <Moon className="h-5 w-5 text-violet-400 fill-violet-400/20" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                )}
              </Button>
              <NotificationsPopover />
           </div>
        </header>

        <div className="flex-1 overflow-auto p-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {children}
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="glass border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Identity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={tempName} onChange={e => setTempName(e.target.value)} className="bg-background/50 border-border focus:border-primary/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role / Designation</Label>
              <Input id="role" value={tempRole} onChange={e => setTempRole(e.target.value)} className="bg-background/50 border-border focus:border-primary/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="initials">Monogram</Label>
              <Input id="initials" value={tempInitials} onChange={e => setTempInitials(e.target.value)} maxLength={3} className="bg-background/50 border-border focus:border-primary/50 uppercase" />
            </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsProfileOpen(false)}>Discard</Button>
             <Button onClick={saveProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Save Identity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};