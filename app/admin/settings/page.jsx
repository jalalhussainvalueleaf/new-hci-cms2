'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Globe, 
  Mail, 
  Shield, 
  Database, 
  Palette,
  Settings as SettingsIcon
} from 'lucide-react';

export default function SettingsPage() {
  const [alert, setAlert] = useState(null);
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'My CMS Website',
    siteDescription: 'A powerful content management system',
    adminEmail: 'admin@example.com',
    timezone: 'UTC-8',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@example.com',
    fromName: 'My CMS',
    enableSMTP: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    enableCaptcha: false,
    forceHTTPS: true,
    enableCSRF: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    enableCache: true,
    cacheExpiration: '3600',
    enableCompression: true,
    enableMinification: true,
    maxUploadSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx',
  });

  const handleSaveGeneral = () => {
    console.log('Saving general settings:', generalSettings);
    setAlert({ type: 'success', message: 'General settings saved successfully' });
  };

  const handleSaveEmail = () => {
    console.log('Saving email settings:', emailSettings);
    setAlert({ type: 'success', message: 'Email settings saved successfully' });
  };

  const handleSaveSecurity = () => {
    console.log('Saving security settings:', securitySettings);
    setAlert({ type: 'success', message: 'Security settings saved successfully' });
  };

  const handleSaveSystem = () => {
    console.log('Saving system settings:', systemSettings);
    setAlert({ type: 'success', message: 'System settings saved successfully' });
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure your CMS system settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={generalSettings.adminEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, adminEmail: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select 
                    id="timezone" 
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  >
                    <option value="UTC-8">UTC-8 (Pacific)</option>
                    <option value="UTC-5">UTC-5 (Eastern)</option>
                    <option value="UTC+0">UTC+0 (GMT)</option>
                    <option value="UTC+1">UTC+1 (CET)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <select 
                    id="date-format" 
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="time-format">Time Format</Label>
                  <select 
                    id="time-format" 
                    className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                    value={generalSettings.timeFormat}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timeFormat: e.target.value })}
                  >
                    <option value="12-hour">12-hour</option>
                    <option value="24-hour">24-hour</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSaveGeneral}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-smtp">Enable SMTP</Label>
                  <p className="text-sm text-gray-600">Use SMTP server for sending emails</p>
                </div>
                <Switch
                  id="enable-smtp"
                  checked={emailSettings.enableSMTP}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableSMTP: checked })}
                />
              </div>

              {emailSettings.enableSMTP && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-username">SMTP Username</Label>
                      <Input
                        id="smtp-username"
                        value={emailSettings.smtpUsername}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-password">SMTP Password</Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveEmail}>
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Require 2FA for all admin users</p>
                </div>
                <Switch
                  id="enable-2fa"
                  checked={securitySettings.enableTwoFactor}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="force-https">Force HTTPS</Label>
                  <p className="text-sm text-gray-600">Redirect all HTTP traffic to HTTPS</p>
                </div>
                <Switch
                  id="force-https"
                  checked={securitySettings.forceHTTPS}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, forceHTTPS: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-csrf">CSRF Protection</Label>
                  <p className="text-sm text-gray-600">Enable Cross-Site Request Forgery protection</p>
                </div>
                <Switch
                  id="enable-csrf"
                  checked={securitySettings.enableCSRF}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableCSRF: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-cache">Enable Caching</Label>
                  <p className="text-sm text-gray-600">Cache content to improve performance</p>
                </div>
                <Switch
                  id="enable-cache"
                  checked={systemSettings.enableCache}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableCache: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-compression">Enable Compression</Label>
                  <p className="text-sm text-gray-600">Compress responses to reduce bandwidth</p>
                </div>
                <Switch
                  id="enable-compression"
                  checked={systemSettings.enableCompression}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableCompression: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-minification">Enable Minification</Label>
                  <p className="text-sm text-gray-600">Minify CSS and JavaScript files</p>
                </div>
                <Switch
                  id="enable-minification"
                  checked={systemSettings.enableMinification}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableMinification: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cache-expiration">Cache Expiration (seconds)</Label>
                  <Input
                    id="cache-expiration"
                    type="number"
                    value={systemSettings.cacheExpiration}
                    onChange={(e) => setSystemSettings({ ...systemSettings, cacheExpiration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-upload-size">Max Upload Size (MB)</Label>
                  <Input
                    id="max-upload-size"
                    type="number"
                    value={systemSettings.maxUploadSize}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxUploadSize: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="allowed-file-types">Allowed File Types</Label>
                <Input
                  id="allowed-file-types"
                  value={systemSettings.allowedFileTypes}
                  onChange={(e) => setSystemSettings({ ...systemSettings, allowedFileTypes: e.target.value })}
                  placeholder="jpg,jpeg,png,gif,pdf,doc,docx"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Comma-separated list of allowed file extensions
                </p>
              </div>

              <Button onClick={handleSaveSystem}>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}