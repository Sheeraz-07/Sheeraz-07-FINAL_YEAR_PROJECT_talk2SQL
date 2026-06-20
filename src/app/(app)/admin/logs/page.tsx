import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, UserCheck, UserX, Trash2, ShieldAlert, LogIn, KeyRound } from 'lucide-react';
import { getActivityLogs, getAllUsers } from '@/app/admin/actions';

function getActionIcon(action: string) {
  switch (action) {
    case 'approve_user': return <UserCheck className="h-4 w-4 text-emerald-500" />;
    case 'reject_user': return <UserX className="h-4 w-4 text-red-500" />;
    case 'delete_user': return <Trash2 className="h-4 w-4 text-red-500" />;
    case 'promote_to_admin':
    case 'demote_to_user': return <ShieldAlert className="h-4 w-4 text-blue-500" />;
    case 'login': return <LogIn className="h-4 w-4 text-emerald-500" />;
    case 'signup': return <KeyRound className="h-4 w-4 text-amber-500" />;
    default: return <Activity className="h-4 w-4 text-primary" />;
  }
}

function formatAction(action: string) {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const [logs, users] = await Promise.all([
    getActivityLogs(),
    getAllUsers()
  ]);

  // Create a map of user_id to email for better display
  const userMap = new Map();
  users.forEach(u => userMap.set(u.user_id, u.email || u.username));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Activity Logs</h2>
          <p className="text-muted-foreground mt-1">Audit trail of system events, logins, and administrative actions.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 bg-secondary/50">
          Last {logs.length} events
        </Badge>
      </div>
      
      <Card className="border-border shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No activity logs found.
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border">
              {logs.map((log) => {
                const actorEmail = userMap.get(log.user_id) || `ID: ${log.user_id}`;
                const details = log.details ? JSON.stringify(log.details) : '';
                
                return (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-secondary border border-border shrink-0 mt-1 sm:mt-0">
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{formatAction(log.action)}</p>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">
                              Data Attached
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Performed by <span className="font-medium text-foreground">{actorEmail}</span>
                        </p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground/70 font-mono mt-1 break-all truncate max-w-md">
                            {details}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="text-xs font-medium text-muted-foreground bg-secondary/40 px-2 py-1 rounded-md">
                        {log.created_at ? new Date(log.created_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        }) : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
