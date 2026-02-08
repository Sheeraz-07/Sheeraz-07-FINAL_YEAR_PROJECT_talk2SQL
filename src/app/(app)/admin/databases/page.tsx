"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, CheckCircle, XCircle, Settings, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const mockDatabases = [
  { id: '1', name: 'Garment ERP Database', type: 'postgresql', host: 'db.garment-factory.com', status: 'connected', queries: 1234 },
  { id: '2', name: 'HR & Payroll DB', type: 'postgresql', host: 'hr.garment-factory.com', status: 'connected', queries: 567 },
  { id: '3', name: 'Inventory Backup', type: 'postgresql', host: 'backup.garment-factory.com', status: 'disconnected', queries: 0 },
];

export default function DatabasesPage() {
  const [databases] = useState(mockDatabases);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Database Connections</h2>
        <Button><Plus className="h-4 w-4 mr-2" />Add Database</Button>
      </div>
      <div className="grid gap-4">
        {databases.map((db) => (
          <Card key={db.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{db.name}</h4>
                    <Badge variant="secondary">{db.type.toUpperCase()}</Badge>
                    {db.status === 'connected' ? (
                      <Badge className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>
                    ) : (
                      <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{db.host} • {db.queries} queries today</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><Settings className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
