import React from 'react';
import { Project } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export const PortfolioCharts = ({ projects }: { projects: Project[] }) => {
  const { theme } = useTheme();

  // 1. Status Distribution
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Neon Palette matching globals.css
  const COLORS: Record<string, string> = {
    'On Track': 'hsl(142, 71%, 45%)',    // Emerald
    'Delayed': 'hsl(47, 95%, 49%)',      // Amber
    'Critical': 'hsl(339, 90%, 51%)',    // Pink/Red
    'Completed': 'hsl(199, 89%, 48%)',   // Cyan
    'Not Started': 'hsl(215, 20%, 65%)'  // Muted Slate
  };

  // 2. Owner Workload (Top 5)
  const ownerCounts = projects.reduce((acc, p) => {
    const owner = p.owner || 'Unassigned';
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(ownerCounts)
    .map(([name, count]) => ({ name: name.split(' ')[0], full: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-border dark:border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-muted-foreground text-xs mb-1">{label}</p>
          <p className="text-foreground dark:text-white font-bold text-lg">
            {payload[0].value}
            <span className="text-xs font-normal text-muted-foreground ml-1">projects</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="glass-card border-border dark:border-white/5 shadow-none">
        <CardHeader className="pb-2 border-b border-border dark:border-white/5">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Portfolio Health</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name] || '#8884d8'} 
                      className="drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border dark:border-white/5 shadow-none">
        <CardHeader className="pb-2 border-b border-border dark:border-white/5">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Resource Load</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tick={{ fill: theme === 'luxury' ? '#94a3b8' : '#64748b' }}
                />
                <Tooltip cursor={{fill: theme === 'luxury' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(263, 70%, 50%)" 
                  radius={[0, 4, 4, 0]} 
                  barSize={16}
                  className="fill-primary drop-shadow-[0_0_8px_rgba(109,40,217,0.3)]"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};