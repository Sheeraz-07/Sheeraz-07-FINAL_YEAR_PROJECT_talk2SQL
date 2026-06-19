import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck, UserCog, Trash2, Users } from 'lucide-react';
import {
  approveUserSignup,
  deleteUserAccount,
  demoteAdminToUser,
  getAllUsers,
  getPendingSignupRequests,
  promoteUserToAdmin,
  rejectUserSignup,
} from '@/app/admin/actions';
import { getCurrentUser } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = (await searchParams) || {};
  const statusFilter = params.status;
  
  const currentUser = await getCurrentUser();

  const [users, pending] = await Promise.all([getAllUsers(), getPendingSignupRequests()]);
  const visibleUsers = statusFilter ? users.filter((u) => u.status === statusFilter) : users;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage platform users, roles, and pending approvals.</p>
        </div>
        <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/50">
          <Button asChild variant={statusFilter === undefined ? 'default' : 'ghost'} size="sm" className="rounded-md">
            <a href="/admin/users">All Users</a>
          </Button>
          <Button asChild variant={statusFilter === 'pending' ? 'default' : 'ghost'} size="sm" className="rounded-md">
            <a href="/admin/users?status=pending">Pending</a>
          </Button>
          <Button asChild variant={statusFilter === 'approved' ? 'default' : 'ghost'} size="sm" className="rounded-md">
            <a href="/admin/users?status=approved">Approved</a>
          </Button>
          <Button asChild variant={statusFilter === 'rejected' ? 'default' : 'ghost'} size="sm" className="rounded-md">
            <a href="/admin/users?status=rejected">Rejected</a>
          </Button>
        </div>
      </div>

      {/* Pending Approvals Widget */}
      {pending.length > 0 && (
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Pending Approvals</CardTitle>
            </div>
            <CardDescription>Users waiting to be approved to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-3">
                {pending.map((row) => (
                  <div key={row.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card border shadow-sm rounded-xl p-4 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {(row.full_name || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{row.full_name}</p>
                        <p className="text-sm text-muted-foreground">{row.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={async () => {
                        'use server';
                        await approveUserSignup(row.email);
                      }}>
                        <Button size="sm" className="gap-1 shadow-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                      </form>
                      <form action={async () => {
                        'use server';
                        await rejectUserSignup(row.email, 'Rejected by admin');
                      }}>
                        <Button size="sm" variant="destructive" className="gap-1 shadow-sm">
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Users Data Table */}
      <Card className="shadow-sm border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">User</th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No users found matching the current criteria.
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user) => (
                  <tr key={user.user_id} className="group hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
                            {(user.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.username || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.role === 'super_admin' ? (
                        <Badge variant="default" className="bg-primary/90 hover:bg-primary">
                          <ShieldAlert className="h-3 w-3 mr-1" /> Super Admin
                        </Badge>
                      ) : user.role === 'admin' ? (
                        <Badge variant="secondary" className="bg-secondary hover:bg-secondary/80">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          User
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge 
                        variant="secondary" 
                        className={
                          user.status === 'approved' 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' 
                            : user.status === 'rejected'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                        }
                      >
                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                        {/* Approve / Reject for Pending Users */}
                        {user.status === 'pending' && (currentUser?.role === 'super_admin' || currentUser?.role === 'admin') ? (
                          <>
                            <form action={async () => {
                              'use server';
                              if (user.email) await approveUserSignup(user.email);
                            }}>
                              <Button variant="outline" size="sm" className="h-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 border-emerald-500/20 shadow-sm">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                              </Button>
                            </form>
                            <form action={async () => {
                              'use server';
                              if (user.email) await rejectUserSignup(user.email, 'Rejected by admin');
                            }}>
                              <Button variant="outline" size="sm" className="h-8 text-red-600 hover:bg-red-500/10 hover:text-red-600 border-red-500/20 shadow-sm">
                                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                              </Button>
                            </form>
                          </>
                        ) : null}

                        {/* Role Management */}
                        {currentUser?.role === 'super_admin' && user.role === 'user' && user.status === 'approved' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 shadow-sm">
                                <UserCog className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                Make Admin
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Promote to Admin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will grant {user.username || user.email} full administrative privileges. Are you sure you want to continue?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <form action={async () => {
                                  'use server';
                                  await promoteUserToAdmin(user.user_id);
                                }}>
                                  <AlertDialogAction type="submit">Yes, Make Admin</AlertDialogAction>
                                </form>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : currentUser?.role === 'super_admin' && user.role === 'admin' && user.status === 'approved' ? (
                          <form action={async () => {
                            'use server';
                            await demoteAdminToUser(user.user_id);
                          }}>
                            <Button variant="outline" size="sm" className="h-8 shadow-sm">
                              <UserCog className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              Demote
                            </Button>
                          </form>
                        ) : null}

                        {/* Delete Account - Hidden for super_admin and self */}
                        {user.role !== 'super_admin' && user.user_id !== currentUser?.user_id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 shadow-sm">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the account for {user.username || user.email} and completely remove their data from the servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <form action={async () => {
                                  'use server';
                                  await deleteUserAccount(user.user_id);
                                }}>
                                  <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Account</AlertDialogAction>
                                </form>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
