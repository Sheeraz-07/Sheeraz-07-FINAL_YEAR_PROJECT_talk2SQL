import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, Server } from 'lucide-react';

export default function DatabasesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Unknown URL';
  const dbHost = supabaseUrl.replace('https://', '').split('/')[0] || 'Unknown Host';

  const databases = [
    {
      id: '1',
      name: 'Talk2SQL Primary Database',
      type: 'postgresql',
      host: dbHost,
      status: 'connected',
      description: 'Main application database storing users, roles, system logs, and application configurations.'
    },
    {
      id: '2',
      name: 'FurnitureFactoryDB',
      type: 'sqlserver',
      host: process.env.NEXT_PUBLIC_SQLSERVER_HOST || '192.168.1.5',
      status: 'connected',
      description: 'Legacy SQL Server database containing raw business data (inventory, production, employees) queried by the AI.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database Connections</h2>
          <p className="text-muted-foreground mt-1">Manage and monitor active database connections.</p>
        </div>
      </div>
      
      <div className="grid gap-4">
        {databases.map((db) => (
          <Card key={db.id} className="p-6 border-border shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{db.name}</h4>
                    <Badge variant="secondary" className="bg-secondary/50">{db.type.toUpperCase()}</Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">
                      <CheckCircle className="h-3 w-3 mr-1" />Connected
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Server className="h-4 w-4 mr-1.5 opacity-70" />
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{db.host}</span>
                  </div>
                  <p className="text-sm mt-2">{db.description}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
