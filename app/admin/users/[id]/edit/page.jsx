'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'subscriber',
    bio: '',
    website: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    requirePasswordChange: false,
    changePassword: false,
  });
  const [errors, setErrors] = useState({});

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user with ID:', params.id);
        const response = await fetch(`/api/users/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch user');
        }
        
        const data = await response.json();
        console.log('Fetched user data:', data);
        
        if (!data) {
          throw new Error('No user data received');
        }
        
        // Split name into first and last name
        const nameParts = data.name ? data.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData({
          firstName,
          lastName,
          username: data.username || '',
          email: data.email || '',
          role: data.role || 'subscriber',
          bio: data.bio || '',
          website: data.website || '',
          status: data.status || 'active',
          requirePasswordChange: data.requirePasswordChange || false,
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load user data. Please try again.'
        });
        // Redirect back to users list on error
        router.push('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id, toast]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation only if changing password
    if (formData.changePassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
        role: formData.role,
        bio: formData.bio,
        website: formData.website,
        status: formData.status,
        requirePasswordChange: formData.requirePasswordChange
      };
      
      // Only include password if changing it
      if (formData.changePassword && formData.password) {
        userData.password = formData.password;
      }
      
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      toast({
        title: 'Success',
        description: 'User updated successfully!',
        variant: 'success'
      });
      
      // Redirect to users list
      router.push('/admin/users');
      
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">Update user account details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/admin/users')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
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
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="status">Account Status</Label>
                  <p className="text-sm text-gray-500">Control user's access to the site</p>
                </div>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label htmlFor="requirePasswordChange">Require Password Change</Label>
                  <p className="text-sm text-gray-500">User must change password on next login</p>
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
      </div>
    </form>
  );
}
