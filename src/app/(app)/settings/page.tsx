"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { User, Palette, Bell, Shield, Upload, Camera, Mail, Lock, Key, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'preferences' | 'security';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState<'en' | 'ur'>(user?.preferredLanguage || 'en');
  const [notifications, setNotifications] = useState({
    email: true,
    queryComplete: true,
    reports: true,
    insights: false,
  });

  // Floating label states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSaveProfile = () => {
    updateUser({ name, preferredLanguage: language });
    toast.success('Profile updated successfully');
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully');
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'preferences' as TabType, label: 'Preferences', icon: Palette },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto relative pb-8">
      {/* Light Grey Background */}
      <div className="fixed inset-0 -z-10 bg-[#F9FAFB] dark:bg-slate-950" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Manage your profile, preferences, and security settings
        </p>
      </div>

      {/* Main Container with Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Left Sidebar - Minimal with Border Indicator */}
        <div className="h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 relative',
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                  )}
                  <Icon className="h-5 w-5 ml-2" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {/* Glassmorphism Profile Banner */}
              <Card className="border border-[#E5E7EB] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                {/* Profile Banner Background with Glassmorphism */}
                <div className="h-24 relative overflow-hidden">
                  {/* Blurred gradient backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-indigo-500/30 dark:from-purple-600/20 dark:via-blue-600/20 dark:to-indigo-600/20 backdrop-blur-3xl" />
                  {/* Mesh pattern overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40" />
                  {/* Soft light orbs */}
                  <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-12 left-1/3 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
                </div>
                
                <div className="px-6 pb-6">
                  {/* Avatar Section - Compact */}
                  <div className="relative -mt-12 mb-5 flex items-end gap-4">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-[5px] border-white dark:border-slate-900 shadow-xl bg-gradient-to-br from-indigo-600 to-blue-600">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                        <Camera className="h-6 w-6 text-white drop-shadow-lg" />
                      </button>
                    </div>
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{user?.name || 'User Name'}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || 'user@example.com'}</p>
                      <Button variant="outline" size="sm" className="mt-2.5 h-8 rounded-lg border-[#E5E7EB] dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-all">
                        <Upload className="h-3 w-3 mr-1.5" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Information Card */}
              <Card className="border border-[#E5E7EB] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-6">
                  Personal Information
                </h3>
                <div className="space-y-5">
                  {/* Name with Icon */}
                  <div>
                    <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block uppercase tracking-wide">
                      Full Name
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your full name"
                        className={cn(
                          "h-10 pl-10 pr-3 border transition-all duration-200 bg-white dark:bg-slate-900 rounded-lg text-sm",
                          focusedField === 'name'
                            ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20"
                            : "border-[#E5E7EB] dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      />
                    </div>
                  </div>

                  {/* Email with Icon */}
                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block uppercase tracking-wide">
                      Email Address
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your email address"
                        className={cn(
                          "h-10 pl-10 pr-3 border transition-all duration-200 bg-white dark:bg-slate-900 rounded-lg text-sm",
                          focusedField === 'email'
                            ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20"
                            : "border-[#E5E7EB] dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        )}
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block uppercase tracking-wide">
                      Preferred Language
                    </Label>
                    <Select value={language} onValueChange={(v: 'en' | 'ur') => setLanguage(v)}>
                      <SelectTrigger className="h-10 border border-[#E5E7EB] dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ur">Roman Urdu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Save Button - Bottom Right with Inset Shadow */}
              <div className="flex justify-end pt-1">
                <Button 
                  onClick={handleSaveProfile}
                  className="h-10 px-8 rounded-lg font-semibold text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_-2px_rgba(59,130,246,0.4)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_6px_16px_-2px_rgba(59,130,246,0.5)] bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 active:scale-[0.98] transition-all duration-200"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {/* Appearance Card */}
              <Card className="border border-[#E5E7EB] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-6">
                  Appearance
                </h3>
                <div className="space-y-5">
                  {/* Theme Selection with Preview Illustrations */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 block uppercase tracking-wide">
                      Theme Preference
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'system', label: 'System' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                          className={cn(
                            'p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02]',
                            theme === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm ring-1 ring-blue-500/30'
                              : 'border-[#E5E7EB] dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                          )}
                        >
                          {/* Theme Preview Illustration */}
                          <div className="mb-3 relative h-16 rounded overflow-hidden">
                            {option.value === 'light' && (
                              <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded flex items-center justify-center">
                                <div className="space-y-1.5 w-full px-2">
                                  <div className="h-1.5 bg-slate-300 rounded w-3/4" />
                                  <div className="h-1.5 bg-slate-200 rounded w-full" />
                                  <div className="h-1.5 bg-slate-200 rounded w-2/3" />
                                </div>
                              </div>
                            )}
                            {option.value === 'dark' && (
                              <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded flex items-center justify-center">
                                <div className="space-y-1.5 w-full px-2">
                                  <div className="h-1.5 bg-slate-600 rounded w-3/4" />
                                  <div className="h-1.5 bg-slate-700 rounded w-full" />
                                  <div className="h-1.5 bg-slate-700 rounded w-2/3" />
                                </div>
                              </div>
                            )}
                            {option.value === 'system' && (
                              <div className="h-full rounded overflow-hidden flex">
                                <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-300 flex items-center justify-center">
                                  <div className="space-y-1 w-full px-1.5">
                                    <div className="h-1 bg-slate-300 rounded w-2/3" />
                                    <div className="h-1 bg-slate-200 rounded w-full" />
                                  </div>
                                </div>
                                <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                  <div className="space-y-1 w-full px-1.5">
                                    <div className="h-1 bg-slate-600 rounded w-2/3" />
                                    <div className="h-1 bg-slate-700 rounded w-full" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs font-semibold block text-center",
                            theme === option.value
                              ? "text-blue-700 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          )}>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Format */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block uppercase tracking-wide">
                      Date Format
                    </Label>
                    <Select defaultValue="mm-dd-yyyy">
                      <SelectTrigger className="h-10 border border-[#E5E7EB] dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Format */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block uppercase tracking-wide">
                      Time Format
                    </Label>
                    <Select defaultValue="12h">
                      <SelectTrigger className="h-10 border border-[#E5E7EB] dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Notifications Card */}
              <Card className="border border-[#E5E7EB] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-6">
                  Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    { 
                      key: 'email', 
                      label: 'Email Notifications', 
                      description: 'Receive email updates for important events',
                      icon: Mail
                    },
                    { 
                      key: 'queryComplete', 
                      label: 'Query Complete', 
                      description: 'Get notified when your queries finish running',
                      icon: Bell
                    },
                    { 
                      key: 'reports', 
                      label: 'Weekly Reports', 
                      description: 'Receive weekly summary of your activity',
                      icon: Bell
                    },
                    { 
                      key: 'insights', 
                      label: 'AI Insights', 
                      description: 'Get personalized insights and recommendations',
                      icon: Bell
                    },
                  ].map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.key}
                        className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-[#E5E7EB] dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5 p-1.5 bg-white dark:bg-slate-800 rounded-md border border-[#E5E7EB] dark:border-slate-700">
                            <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">{notification.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notification.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications[notification.key as keyof typeof notifications]}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, [notification.key]: checked })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end pt-1">
                <Button 
                  onClick={handleSavePreferences}
                  className="h-10 px-8 rounded-lg font-semibold text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_-2px_rgba(59,130,246,0.4)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_6px_16px_-2px_rgba(59,130,246,0.5)] bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 active:scale-[0.98] transition-all duration-200"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {/* Security Settings Card */}
              <Card className="border border-[#E5E7EB] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-6">
                  Security Settings
                </h3>
                <div className="space-y-4">
                  {/* Password */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-[#E5E7EB] dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-white dark:bg-slate-800 rounded-md border border-[#E5E7EB] dark:border-slate-700">
                        <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">Password</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 rounded-lg border-[#E5E7EB] text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 transition-all"
                    >
                      <Key className="h-3 w-3 mr-1.5" />
                      Change
                    </Button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-[#E5E7EB] dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-white dark:bg-slate-800 rounded-md border border-[#E5E7EB] dark:border-slate-700">
                        <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 rounded-lg border-[#E5E7EB] text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 transition-all"
                    >
                      Enable
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Privacy & Data Card */}
              <Card className="border border-[#E5E7EB] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-6">
                  Privacy & Data
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-[#E5E7EB] dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">Query History</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Save your query history for analytics</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-[#E5E7EB] dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">Usage Analytics</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Help us improve by sharing anonymous usage data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-[#E5E7EB] dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">Data Sharing</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Share data with third-party integrations</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="border border-red-200 dark:border-red-900/50 shadow-sm bg-red-50/30 dark:bg-red-950/10 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md">
                    <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-red-900 dark:text-red-400">Danger Zone</h3>
                    <p className="text-xs text-red-700 dark:text-red-400/80 mt-0.5">Irreversible actions. Proceed with caution.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full h-9 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-700 text-xs font-medium transition-all"
                  >
                    Delete All Query History
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-9 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-700 text-xs font-medium transition-all"
                  >
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
