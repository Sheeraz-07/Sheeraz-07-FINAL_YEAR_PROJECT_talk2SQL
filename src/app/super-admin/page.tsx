import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers, getPendingSignupRequests } from '@/app/admin/actions';

export default async function SuperAdminPage() {
  const [users, pending] = await Promise.all([getAllUsers(), getPendingSignupRequests()]);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Total Users</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{users.length}</CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{pending.length}</CardContent>
      </Card>
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle>Admins</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{users.filter((u) => u.role === 'admin').length}</CardContent>
      </Card>
    </div>
  );
}
