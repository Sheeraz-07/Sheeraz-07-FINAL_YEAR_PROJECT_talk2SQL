import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers } from '@/app/admin/actions';
import { Badge } from '@/components/ui/badge';

export default async function SuperAdminUsersPage() {
  const users = await getAllUsers();
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user) => (
          <div key={user.user_id} className="flex items-center justify-between rounded-md border p-2 text-sm">
            <span>{user.email || user.username}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{user.role}</Badge>
              <Badge variant="outline">{user.status || 'pending'}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
