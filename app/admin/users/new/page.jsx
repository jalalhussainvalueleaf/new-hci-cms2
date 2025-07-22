'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Mail, User, Shield, Loader2 } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bio: formData.bio,
        website: formData.website,
        status: 'active',
        requirePasswordChange: formData.requirePasswordChange,
        sendWelcomeEmail: formData.sendWelcomeEmail
      };
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }
      
      toast({
        title: 'Success',
        description: 'User created successfully!',
        variant: 'success'
      });
      
      // Redirect to users list
      router.push('/admin/users');
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <Link href="/admin/users">
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
            <p className="text-gray-600">Create a new user account</p>
          </div>
        </div>
        <div className="flex space-x-2">
        <Link href="/admin/users">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create User
            </>
          )}
        </Button>
      </div>
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="firstName">First Name</Label>
                    {errors.firstName && <span className="text-sm text-red-500">{errors.firstName}</span>}
                  </div>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className={`mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name (Optional)</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="username">Username</Label>
                  {errors.username && <span className="text-sm text-red-500">{errors.username}</span>}
                </div>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="johndoe"
                  className={`mt-1 ${errors.username ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Username must be unique and contain only letters, numbers, and underscores
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="email">Email Address</Label>
                  {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  {errors.password && <span className="text-sm text-red-500">{errors.password}</span>}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter secure password"
                  className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Password should be at least 8 characters long
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword}</span>}
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  className={`mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={isSubmitting}
                >
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
                  disabled={isSubmitting}
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
    </form>
  );
}
