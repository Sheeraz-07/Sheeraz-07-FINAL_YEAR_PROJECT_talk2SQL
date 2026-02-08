"use client";

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Activity, User, Database, FileText } from 'lucide-react';

const logs = [
  { id: '1', action: 'Query executed', user: 'John Doe', target: 'Main Database', time: '2 min ago', type: 'query' },
  { id: '2', action: 'User logged in', user: 'Jane Smith', target: '', time: '15 min ago', type: 'auth' },
  { id: '3', action: 'Report generated', user: 'Mike Johnson', target: 'Weekly Sales', time: '1 hour ago', type: 'report' },
  { id: '4', action: 'Database connected', user: 'Admin', target: 'Analytics DB', time: '2 hours ago', type: 'system' },
];

export default function LogsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'query': return Database;
      case 'auth': return User;
      case 'report': return FileText;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-10" />
        </div>
      </div>
      <Card className="divide-y divide-border">
        {logs.map((log) => {
          const Icon = getIcon(log.type);
          return (
            <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30">
              <div className="p-2 rounded-lg bg-secondary"><Icon className="h-4 w-4" /></div>
              <div className="flex-1">
                <p className="font-medium">{log.action}</p>
                <p className="text-sm text-muted-foreground">
                  {log.user} {log.target && `• ${log.target}`}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">{log.time}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
