"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MoreVertical } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@company.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'analyst', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'user', status: 'inactive' },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-t border-border hover:bg-secondary/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4"><Badge variant="secondary">{user.role}</Badge></td>
                <td className="p-4">
                  <Badge className={user.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
