'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Palette, Users } from 'lucide-react';

export default function DoctorCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/doctor-categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories.map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          isActive: cat.isActive,
          order: cat.order,
          doctorCount: cat.doctorCount,
        })));
      }
    } catch (error) {
      console.error('Error loading doctor categories:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load doctor categories'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name is required'
      });
      return;
    }
    
    const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    try {
      const response = await fetch('/api/doctor-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCategory, slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      toast({
        title: 'Success',
        description: `Doctor category "${newCategory.name}" added successfully!`,
        variant: 'success'
      });
      
      setNewCategory({
        name: '',
        slug: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        isActive: true,
        order: 0,
      });
      
      loadCategories();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create category. Please try again.'
      });
    }
  };

  const handleEditClick = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setEditModal({ 
        open: true, 
        category: {
          ...category,
          editName: category.name,
          editSlug: category.slug,
          editDescription: category.description,
          editIcon: category.icon,
          editColor: category.color,
          editIsActive: category.isActive,
          editOrder: category.order,
        }
      });
    }
  };

  const handleEditSave = async () => {
    if (!editModal?.category.editName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name is required'
      });
      return;
    }

    try {
      const response = await fetch(`/api/doctor-categories/${editModal.category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editModal.category.editName,
          slug: editModal.category.editSlug,
          description: editModal.category.editDescription,
          icon: editModal.category.editIcon,
          color: editModal.category.editColor,
          isActive: editModal.category.editIsActive,
          order: editModal.category.editOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      toast({
        title: 'Success',
        description: `Category "${editModal.category.editName}" updated successfully!`,
        variant: 'success'
      });
      
      setEditModal(null);
      loadCategories();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update category. Please try again.'
      });
    }
  };

  const handleEditCancel = () => {
    setEditModal(null);
  };

  const handleDeleteClick = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    setDeleteModal({ open: true, category });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal?.category) return;

    try {
      const response = await fetch(`/api/doctor-categories/${deleteModal.category.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      toast({
        title: 'Success',
        description: `Category "${deleteModal.category.name}" deleted successfully!`,
        variant: 'success'
      });
      
      setDeleteModal(null);
      loadCategories();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete category. Please try again.'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Categories</h1>
          <p className="text-gray-600">Manage medical specialties and doctor categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Category */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Cardiology"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                placeholder="cardiology"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                placeholder="Category description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category-icon">Icon (Optional)</Label>
              <Input
                id="category-icon"
                placeholder="e.g., heart, brain"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category-color">Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="category-color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category-order">Display Order</Label>
              <Input
                id="category-order"
                type="number"
                value={newCategory.order}
                onChange={(e) => setNewCategory({ ...newCategory, order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="category-active">Active</Label>
              <Switch
                id="category-active"
                checked={newCategory.isActive}
                onCheckedChange={(checked) => setNewCategory({ ...newCategory, isActive: checked })}
              />
            </div>

            <Button onClick={handleAddCategory} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Doctor Categories</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Doctors</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{category.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                        {category.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{category.doctorCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.order}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(category.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(category.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
      </div>

      {/* Edit Category Modal */}
      <Dialog open={editModal?.open || false} onOpenChange={(open) => !open && handleEditCancel()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Doctor Category</DialogTitle>
            <DialogDescription>
              Update the category information below.
            </DialogDescription>
          </DialogHeader>
          {editModal?.category && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editModal.category.editName}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    category: { ...editModal.category, editName: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editModal.category.editSlug}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    category: { ...editModal.category, editSlug: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editModal.category.editDescription}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    category: { ...editModal.category, editDescription: e.target.value }
                  })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-icon">Icon</Label>
                <Input
                  id="edit-icon"
                  value={editModal.category.editIcon}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    category: { ...editModal.category, editIcon: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={editModal.category.editColor}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      category: { ...editModal.category, editColor: e.target.value }
                    })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={editModal.category.editColor}
                    onChange={(e) => setEditModal({
                      ...editModal,
                      category: { ...editModal.category, editColor: e.target.value }
                    })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-order">Display Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={editModal.category.editOrder}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    category: { ...editModal.category, editOrder: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-active">Active</Label>
                <Switch
                  id="edit-active"
                  checked={editModal.category.editIsActive}
                  onCheckedChange={(checked) => setEditModal({
                    ...editModal,
                    category: { ...editModal.category, editIsActive: checked }
                  })}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal?.open || false} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Doctor Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteModal?.category?.name}"? This action cannot be undone.
              {deleteModal?.category?.doctorCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Warning: This category is currently used by {deleteModal.category.doctorCount} doctor(s).
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}