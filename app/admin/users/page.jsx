'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    role: 'administrator',
    status: 'active',
    posts: 12,
    lastLogin: '2024-01-15',
    avatar: 'JD',
    bio: 'Senior developer with 10+ years of experience',
    website: 'https://johndoe.com',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    role: 'editor',
    status: 'active',
    posts: 8,
    lastLogin: '2024-01-14',
    avatar: 'JS',
    bio: 'Content editor and writer',
    website: '',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    username: 'mikejohnson',
    role: 'author',
    status: 'active',
    posts: 15,
    lastLogin: '2024-01-13',
    avatar: 'MJ',
    bio: 'Technical writer and blogger',
    website: 'https://mikejohnson.blog',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    username: 'sarahwilson',
    role: 'contributor',
    status: 'inactive',
    posts: 3,
    lastLogin: '2024-01-10',
    avatar: 'SW',
    bio: 'Freelance contributor',
    website: '',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    username: 'davidbrown',
    role: 'subscriber',
    status: 'active',
    posts: 0,
    lastLogin: '2024-01-12',
    avatar: 'DB',
    bio: 'Regular subscriber',
    website: '',
  },
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState(null);
  
  // Modal states
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);

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
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditModal({
        open: true,
        user: {
          ...user,
          editName: user.name,
          editEmail: user.email,
          editUsername: user.username,
          editRole: user.role,
          editBio: user.bio,
          editWebsite: user.website,
        }
      });
    }
  };

  const handleEditSave = () => {
    if (!editModal?.user.editName.trim() || !editModal?.user.editEmail.trim()) {
      setAlert({ type: 'error', message: 'Name and email are required' });
      return;
    }
    console.log('Updating user:', editModal.user);
    setAlert({ type: 'success', message: `User "${editModal.user.editName}" updated successfully` });
    setEditModal(null);
  };

  const handleEditCancel = () => {
    setEditModal(null);
  };

  const handleSuspendClick = (userId) => {
    const user = users.find(u => u.id === userId);
    setSuspendModal({ open: true, user });
  };

  const handleSuspendConfirm = () => {
    if (suspendModal?.user) {
      const action = suspendModal.user.status === 'active' ? 'suspended' : 'activated';
      setAlert({ type: 'success', message: `User "${suspendModal.user.name}" ${action} successfully` });
      setSuspendModal(null);
    }
  };

  const handleSuspendCancel = () => {
    setSuspendModal(null);
  };

  const handleDeleteClick = (userId) => {
    const user = users.find(u => u.id === userId);
    setDeleteModal({ open: true, user });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal?.user) {
      setAlert({ type: 'success', message: `User "${deleteModal.user.name}" deleted successfully` });
      setDeleteModal(null);
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
      {alert && (
        <Alert className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
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

      {/* Edit User Modal */}
      <Dialog open={editModal?.open || false} onOpenChange={(open) => !open && handleEditCancel()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          {editModal?.user && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editModal.user.editName}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      user: { ...editModal.user, editName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editModal.user.editUsername}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      user: { ...editModal.user, editUsername: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editModal.user.editEmail}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    user: { ...editModal.user, editEmail: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-role">User Role</Label>
                <Select 
                  value={editModal.user.editRole} 
                  onValueChange={(value) => setEditModal({
                    ...editModal,
                    user: { ...editModal.user, editRole: value }
                  })}
                >
                  <SelectTrigger>
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
                <p className="text-sm text-gray-600 mt-1">
                  {getRoleDescription(editModal.user.editRole)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="edit-website">Website (Optional)</Label>
                <Input
                  id="edit-website"
                  type="url"
                  value={editModal.user.editWebsite}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    user: { ...editModal.user, editWebsite: e.target.value }
                  })}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-bio">Bio (Optional)</Label>
                <Textarea
                  id="edit-bio"
                  value={editModal.user.editBio}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    user: { ...editModal.user, editBio: e.target.value }
                  })}
                  rows={3}
                  placeholder="Tell us about this user..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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