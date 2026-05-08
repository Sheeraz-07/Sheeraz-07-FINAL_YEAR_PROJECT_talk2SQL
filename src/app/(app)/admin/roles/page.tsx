import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import { getAllUsers } from '@/app/admin/actions';

export default async function RolesPage() {
  const users = await getAllUsers();
  
  const counts = {
    super_admin: users.filter((u) => u.role === 'super_admin').length,
    admin: users.filter((u) => u.role === 'admin').length,
    user: users.filter((u) => u.role === 'user').length,
  };

  const roles = [
    { 
      id: 'super_admin', 
      name: 'Super Admin', 
      icon: <ShieldAlert className="h-6 w-6 text-primary" />,
      users: counts.super_admin, 
      permissions: ['Full platform access', 'Manage admins', 'Delete users', 'View system logs', 'Manage roles'] 
    },
    { 
      id: 'admin', 
      name: 'Admin', 
      icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
      users: counts.admin, 
      permissions: ['Approve/Reject signups', 'Manage users', 'View activity logs', 'Access all databases'] 
    },
    { 
      id: 'user', 
      name: 'User', 
      icon: <User className="h-6 w-6 text-muted-foreground" />,
      users: counts.user, 
      permissions: ['Read-only app access', 'Talk2SQL queries', 'View own profile', 'Limited data access'] 
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Roles & Permissions</h2>
          <p className="text-muted-foreground mt-1">Overview of system roles, active user counts, and access levels.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/50">
                  {role.icon}
                </div>
                <Badge variant="outline" className="bg-background">
                  {role.users} active {role.users === 1 ? 'user' : 'users'}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-4">{role.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Permissions</h4>
                <ul className="space-y-2">
                  {role.permissions.map((p, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Shield className="h-4 w-4 mr-2 text-primary/70 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
