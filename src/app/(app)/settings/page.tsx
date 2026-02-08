"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { User, Palette, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState<'en' | 'ur'>(user?.preferredLanguage || 'en');
  const [notifications, setNotifications] = useState({
    email: true,
    queryComplete: true,
    reports: true,
    insights: false,
  });

  const handleSaveProfile = () => {
    updateUser({ name, preferredLanguage: language });
    toast.success('Profile updated successfully');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Profile Settings</h3>
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              {/* Language */}
              <div className="grid gap-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select value={language} onValueChange={(v: 'en' | 'ur') => setLanguage(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ur">Roman Urdu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label>Password</Label>
                <Button variant="outline" className="w-fit">
                  Change Password
                </Button>
              </div>

              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Preferences</h3>
            <div className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <Select value={theme} onValueChange={(v: 'light' | 'dark' | 'system') => setTheme(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Default Database */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Default Database</Label>
                  <p className="text-sm text-muted-foreground">
                    Database used for new queries
                  </p>
                </div>
                <Select defaultValue="main_db">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_db">Main Database</SelectItem>
                    <SelectItem value="sales_db">Sales DB</SelectItem>
                    <SelectItem value="analytics_db">Analytics DB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results per page */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Results per Page</Label>
                  <p className="text-sm text-muted-foreground">
                    Number of rows to show in query results
                  </p>
                </div>
                <Select defaultValue="25">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice auto-enable */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-enable Voice Input</Label>
                  <p className="text-sm text-muted-foreground">
                    Start listening when opening the query page
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Notification Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(c) => setNotifications({ ...notifications, email: c })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Query Completion</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when long-running queries complete
                  </p>
                </div>
                <Switch
                  checked={notifications.queryComplete}
                  onCheckedChange={(c) => setNotifications({ ...notifications, queryComplete: c })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Report Generation</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when scheduled reports are ready
                  </p>
                </div>
                <Switch
                  checked={notifications.reports}
                  onCheckedChange={(c) => setNotifications({ ...notifications, reports: c })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>AI Insights</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when new insights are detected
                  </p>
                </div>
                <Switch
                  checked={notifications.insights}
                  onCheckedChange={(c) => setNotifications({ ...notifications, insights: c })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Privacy & Data</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Query History Retention</Label>
                  <p className="text-sm text-muted-foreground">
                    How long to keep query history
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve Talk2SQL by sharing anonymous usage data
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-4">Data Actions</h4>
                <div className="flex gap-2">
                  <Button variant="outline">Export My Data</Button>
                  <Button variant="destructive">Clear All History</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
