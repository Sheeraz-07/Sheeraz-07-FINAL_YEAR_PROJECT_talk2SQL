"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, Edit } from 'lucide-react';

const roles = [
  { id: 'admin', name: 'Admin', users: 2, permissions: ['All access', 'Manage users', 'Manage databases'] },
  { id: 'analyst', name: 'Analyst', users: 5, permissions: ['Query all databases', 'Create reports', 'View analytics'] },
  { id: 'user', name: 'User', users: 12, permissions: ['Query assigned databases', 'View reports'] },
];

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Roles & Permissions</h2>
        <Button><Plus className="h-4 w-4 mr-2" />Create Role</Button>
      </div>
      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
                <div>
                  <h4 className="font-semibold">{role.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{role.users} users</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((p) => (
                      <Badge key={p} variant="secondary">{p}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
