"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

import { checkUserForPasswordReset } from '@/app/actions';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // First check if the user is registered and approved
      const verificationResult = await checkUserForPasswordReset(data.email);
      if (!verificationResult.success) {
        throw new Error(verificationResult.error);
      }

      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-mesh relative overflow-hidden p-4">
      <Card className="w-full max-w-md auth-glass-panel transition-all duration-500 animate-fade-in hover:shadow-2xl relative z-10 border-border/50">
        <CardHeader className="text-center space-y-5 pb-6 pt-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            {isSubmitted ? (
              <CheckCircle className="h-7 w-7 text-accent-foreground" />
            ) : (
              <MessageSquare className="h-7 w-7 text-accent-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isSubmitted ? 'Check your email' : 'Forgot password?'}
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              {isSubmitted
                ? 'We sent a password reset link to your email'
                : 'No worries, we\'ll send you reset instructions'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          {isSubmitted ? (
            <div className="text-center space-y-6">
              <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl">
                Didn&apos;t receive the email? Check your spam folder or try again below.
              </p>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl font-semibold border-border/50 hover:bg-secondary/80 transition-all"
                onClick={() => setIsSubmitted(false)}
              >
                Try again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-11 rounded-xl border-border/50 focus:border-accent"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Reset password
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-border/30 pt-6 pb-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium hover-link-contrast transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
