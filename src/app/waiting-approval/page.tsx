'use client';

import { useState } from 'react';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signOutAction } from '@/app/actions';

export default function WaitingApprovalPage() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOutAction();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-2xl">Pending Approval</CardTitle>
            <CardDescription className="mt-2">
              Your account is awaiting admin verification
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              What&apos;s happening?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our administrators are verifying your employee information. This usually takes
              1-2 business days. You&apos;ll receive an email notification once your account is
              approved.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-2">What we&apos;re checking:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Email verification
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Employee database lookup
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Department verification
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Have questions? Contact your department administrator.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              disabled={isSigningOut}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isSigningOut ? 'Logging out...' : 'Back to login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
