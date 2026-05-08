import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperAdminSettingsPage() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Super Admin Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        This area is reserved for elevated account governance and environment-level administrative
        controls.
      </CardContent>
    </Card>
  );
}
