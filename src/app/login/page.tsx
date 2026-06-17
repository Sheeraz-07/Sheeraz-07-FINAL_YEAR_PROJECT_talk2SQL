"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signInAction } from '@/app/actions';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signInAction(data.email, data.password);

      if (result.success) {
        toast.success('Welcome back!');

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        if ((result as { pendingApproval?: boolean }).pendingApproval) {
          toast.info('Your account is pending approval.');
          setTimeout(() => {
            window.location.href = '/waiting-approval';
          }, 500);
          return;
        }
        toast.error(result.error || 'Sign in failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-auth-mesh relative overflow-hidden">
      {/* Left Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <Card className="w-full max-w-md auth-glass-panel transition-all duration-500 animate-fade-in hover:shadow-2xl">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Talk2SQL</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Database Queries</p>
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Please login using your employee credentials
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-accent font-medium hover-link-contrast"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 rounded-xl border-border/50 focus:border-accent"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg text-muted-foreground hover-icon-contrast"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Log in
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-4 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-accent font-semibold hover-link-contrast">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right Section - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
        <div className="relative z-10 max-w-lg auth-glass-panel p-10 rounded-3xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
              <Database className="h-4 w-4" />
              Employee Internal Dashboard
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Query your databases naturally with AI
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Transform natural language into SQL queries instantly. No technical expertise required.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-foreground">1000+</div>
              <div className="text-sm font-medium text-muted-foreground">Queries Processed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-foreground">99.9%</div>
              <div className="text-sm font-medium text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-foreground">24/7</div>
              <div className="text-sm font-medium text-muted-foreground">Availability</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-foreground">50ms</div>
              <div className="text-sm font-medium text-muted-foreground">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
