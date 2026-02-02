import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Briefcase, 
  Archive, 
  Settings, 
  Search,
  Moon,
  Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '@/services/storage';
import { Project } from '@/types/data';
import { useTheme } from '@/contexts/ThemeContext';
import { DialogTitle } from '@radix-ui/react-dialog';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    
    // Load projects for search
    setProjects(StorageService.getProjects());
    
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/pipeline'))}>
            <Briefcase className="mr-2 h-4 w-4" />
            Pipeline
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/archive'))}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin'))}>
            <Settings className="mr-2 h-4 w-4" />
            Admin
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => setTheme('luxury'))}>
            <Moon className="mr-2 h-4 w-4" />
            Theme: Luxury Dark
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('modern'))}>
            <Sun className="mr-2 h-4 w-4" />
            Theme: Modern Light
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Projects">
          {projects.map((project) => (
             <CommandItem 
               key={project.id} 
               onSelect={() => runCommand(() => {
                  if (project.category === 'Live') navigate('/');
                  else if (project.category === 'Pipeline' || project.category === 'SOW') navigate('/pipeline');
                  else navigate('/archive');
               })}
             >
               <Search className="mr-2 h-4 w-4" />
               <div className="flex flex-col">
                  <span>{project.name}</span>
                  <span className="text-xs text-muted-foreground">{project.client} • {project.status}</span>
               </div>
             </CommandItem>
          ))}
        </CommandGroup>

      </CommandList>
    </CommandDialog>
  );
};