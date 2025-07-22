'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react';

const roleColors = {
  administrator: 'bg-red-100 text-red-800',
  editor: 'bg-blue-100 text-blue-800',
  author: 'bg-green-100 text-green-800',
  contributor: 'bg-yellow-100 text-yellow-800',
  subscriber: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users from:', process.env.NODE_ENV === 'production' ? '/api/users' : 'http://localhost:3000/api/users');
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Users API Response:', data);
      
      if (!data.users) {
        throw new Error('No users array in response');
      }
      
      const processedUsers = data.users.map(user => {
        if (!user._id) {
          console.error('User missing _id:', user);
          return null;
        }
        return {
          ...user,
          id: user._id,  // Ensure id is set from _id
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
          avatar: user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?',
          posts: 0, // TODO: Count posts by user
          // Ensure all required fields have defaults
          name: user.name || 'Unknown User',
          email: user.email || 'No email',
          username: user.username || 'No username',
          role: user.role || 'subscriber',
          status: user.status || 'inactive',
          bio: user.bio || '',
          website: user.website || ''
        };
      }).filter(Boolean); // Remove any null entries from mapping
      
      console.log('Processed Users:', processedUsers);
      setUsers(processedUsers);
    } catch (error) {
      console.error('Error in loadUsers:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        env: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        isClientSide: typeof window !== 'undefined'
      });
      
      toast({
        variant: 'destructive',
        title: 'Error Loading Users',
        description: error.message || 'Failed to load users. Please check the console for more details.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewProfile = (userId) => {
    const user = users.find(u => u.id === userId);
    setViewModal({ open: true, user });
  };

  const handleEditClick = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleSuspendClick = (userId) => {
    const user = users.find(u => u.id === userId);
    setSuspendModal({ open: true, user });
  };

  const handleSuspendConfirm = async () => {
    if (!suspendModal?.user) return;
    
    try {
      const newStatus = suspendModal.user.status === 'active' ? 'suspended' : 'active';
      const response = await fetch(`/api/users/${suspendModal.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === suspendModal.user.id
            ? { ...user, status: newStatus }
            : user
        )
      );

      const action = newStatus === 'suspended' ? 'suspended' : 'activated';
      toast({
        title: 'Success',
        description: `User "${suspendModal.user.name}" ${action} successfully!`,
        variant: 'success'
      });
      
      setSuspendModal(null);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${suspendModal?.user.status === 'active' ? 'suspend' : 'activate'} user. Please try again.`
      });
    }
  };

  const handleSuspendCancel = () => {
    setSuspendModal(null);
  };

  const handleDeleteClick = (userId) => {
    const user = users.find(u => u.id === userId);
    setDeleteModal({ open: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal?.user) return;
    
    try {
      const response = await fetch(`/api/users/${deleteModal.user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Update local state by removing the deleted user
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== deleteModal.user.id)
      );

      toast({
        title: 'Success',
        description: `User "${deleteModal.user.name}" deleted successfully!`,
        variant: 'success'
      });
      
      setDeleteModal(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user. Please try again.'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(null);
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      administrator: 'Full access to all features and settings',
      editor: 'Can publish and manage posts, pages, and comments',
      author: 'Can publish and manage their own posts',
      contributor: 'Can write and manage their own posts but cannot publish',
      subscriber: 'Can only manage their profile and read content',
    };
    return descriptions[role] || '';
  };

  return (
    <div className="space-y-6">
      {/* {alert && (
        <Alert className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )} */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(user => user.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'administrator').length}
            </div>
            <p className="text-xs text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {users.filter(user => {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                return user.createdAt && new Date(user.createdAt) > oneMonthAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">New This Month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="administrator">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="subscriber">Subscriber</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[user.status]}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.posts}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(user.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(user.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleSuspendClick(user.id)}>
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspendClick(user.id)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(user.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* View Profile Modal */}
      <Dialog open={viewModal?.open || false} onOpenChange={(open) => !open && setViewModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              View user details and account information
            </DialogDescription>
          </DialogHeader>
          {viewModal?.user && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {viewModal.user.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewModal.user.name}</h3>
                  <p className="text-gray-600">{viewModal.user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={roleColors[viewModal.user.role]}>
                      {viewModal.user.role}
                    </Badge>
                    <Badge className={statusColors[viewModal.user.status]}>
                      {viewModal.user.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Username</Label>
                  <p className="mt-1">{viewModal.user.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Posts</Label>
                  <p className="mt-1">{viewModal.user.posts}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                  <p className="mt-1">{viewModal.user.lastLogin}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Website</Label>
                  <p className="mt-1">{viewModal.user.website || 'Not provided'}</p>
                </div>
              </div>
              
              {viewModal.user.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bio</Label>
                  <p className="mt-1 text-gray-700">{viewModal.user.bio}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Role Permissions</Label>
                <p className="mt-1 text-sm text-gray-600">{getRoleDescription(viewModal.user.role)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit functionality moved to /admin/users/[id]/edit page */}

      {/* Suspend/Activate User Modal */}
      <Dialog open={suspendModal?.open || false} onOpenChange={(open) => !open && handleSuspendCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspendModal?.user?.status === 'active' ? 'Suspend User' : 'Activate User'}
            </DialogTitle>
            <DialogDescription>
              {suspendModal?.user?.status === 'active' 
                ? `Are you sure you want to suspend "${suspendModal?.user?.name}"? They will not be able to log in until reactivated.`
                : `Are you sure you want to activate "${suspendModal?.user?.name}"? They will be able to log in and access their account.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleSuspendCancel}>
              Cancel
            </Button>
            <Button 
              variant={suspendModal?.user?.status === 'active' ? 'destructive' : 'default'}
              onClick={handleSuspendConfirm}
            >
              {suspendModal?.user?.status === 'active' ? 'Suspend User' : 'Activate User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteModal?.open || false} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteModal?.user?.name}"? This action cannot be undone and will permanently remove their account and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}