'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Mail, User, Shield } from 'lucide-react';

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'subscriber',
    bio: '',
    website: '',
    sendWelcomeEmail: true,
    requirePasswordChange: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Creating user:', formData);
    // Here you would typically save to your backend
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
            <p className="text-gray-600">Create a new user account</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="johndoe"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Username must be unique and contain only letters, numbers, and underscores
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://johndoe.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about this user..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter secure password"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Password should be at least 8 characters long
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requirePasswordChange">Require Password Change</Label>
                  <p className="text-sm text-gray-500">User must change password on first login</p>
                </div>
                <Switch
                  id="requirePasswordChange"
                  checked={formData.requirePasswordChange}
                  onCheckedChange={(checked) => handleInputChange('requirePasswordChange', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Role & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">User Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="subscriber">Subscriber</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Role Permissions:</p>
                  {formData.role === 'administrator' && (
                    <p className="text-sm text-gray-600">Full access to all features and settings</p>
                  )}
                  {formData.role === 'editor' && (
                    <p className="text-sm text-gray-600">Can publish and manage posts, pages, and comments</p>
                  )}
                  {formData.role === 'author' && (
                    <p className="text-sm text-gray-600">Can publish and manage their own posts</p>
                  )}
                  {formData.role === 'contributor' && (
                    <p className="text-sm text-gray-600">Can write and manage their own posts but cannot publish</p>
                  )}
                  {formData.role === 'subscriber' && (
                    <p className="text-sm text-gray-600">Can only manage their profile and read content</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sendWelcomeEmail">Send Welcome Email</Label>
                  <p className="text-sm text-gray-500">Send account details to new user</p>
                </div>
                <Switch
                  id="sendWelcomeEmail"
                  checked={formData.sendWelcomeEmail}
                  onCheckedChange={(checked) => handleInputChange('sendWelcomeEmail', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Active Account</p>
                <p className="text-sm text-green-700">User will be able to log in immediately</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}