'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories.map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          count: cat.count,
          parent: cat.parent,
        })));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setAlert({ type: 'error', message: 'Failed to load categories' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      setAlert({ type: 'error', message: 'Category name is required' });
      return;
    }
    
    const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCategory, slug }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to create category. Please try again.'
        });
      } else {
        toast({
          title: 'Success',
          description: `Category "${newCategory.name}" added successfully!`,
          variant: 'success'
        });
        setNewCategory({ name: '', slug: '', description: '', parent: '' });
        loadCategories();
      }
    })
    .catch(() => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create category. Please try again.'
      });
    });
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
          editParent: category.parent || '',
        }
      });
    }
  };

  const handleEditSave = () => {
    if (!editModal?.category.editName.trim()) {
      setAlert({ type: 'error', message: 'Category name is required' });
      return;
    }
    console.log('Updating category:', editModal.category);
    setAlert({ type: 'success', message: `Category "${editModal.category.editName}" updated successfully` });
    setEditModal(null);
  };

  const handleEditCancel = () => {
    setEditModal(null);
  };

  const handleDeleteClick = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    setDeleteModal({ open: true, category });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal?.category) {
      setAlert({ type: 'success', message: `Category "${deleteModal.category.name}" deleted successfully` });
      setDeleteModal(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Organize your posts with categories</p>
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
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                placeholder="category-slug"
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
              <CardTitle>All Categories</CardTitle>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.parent && <span className="text-gray-400">— </span>}
                      {category.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {category.description}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {category.slug}
                    </TableCell>
                    <TableCell>{category.count}</TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteModal?.category?.name}"? This action cannot be undone.
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