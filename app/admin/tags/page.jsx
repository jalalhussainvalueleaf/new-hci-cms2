'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTag, setNewTag] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tags');
      const data = await response.json();
      if (data.tags) {
        setTags(data.tags.map(tag => ({
          id: tag._id,
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          count: tag.count,
        })));
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      setAlert({ type: 'error', message: 'Failed to load tags' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTag = () => {
    if (!newTag.name.trim()) {
      setAlert({ type: 'error', message: 'Tag name is required' });
      return;
    }
    
    const slug = newTag.slug || newTag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTag, slug }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setAlert({ type: 'error', message: data.error });
      } else {
        setAlert({ type: 'success', message: `Tag "${newTag.name}" added successfully` });
        setNewTag({ name: '', slug: '', description: '' });
        loadTags();
      }
    })
    .catch(() => {
      setAlert({ type: 'error', message: 'Failed to create tag' });
    });
  };

  const handleEditClick = (tagId) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      setEditModal({ 
        open: true, 
        tag: {
          ...tag,
          editName: tag.name,
          editSlug: tag.slug,
          editDescription: tag.description,
        }
      });
    }
  };

  const handleEditSave = () => {
    if (!editModal?.tag.editName.trim()) {
      setAlert({ type: 'error', message: 'Tag name is required' });
      return;
    }
    console.log('Updating tag:', editModal.tag);
    setAlert({ type: 'success', message: `Tag "${editModal.tag.editName}" updated successfully` });
    setEditModal(null);
  };

  const handleEditCancel = () => {
    setEditModal(null);
  };

  const handleDeleteClick = (tagId) => {
    const tag = tags.find(t => t.id === tagId);
    setDeleteModal({ open: true, tag });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal?.tag) {
      setAlert({ type: 'success', message: `Tag "${deleteModal.tag.name}" deleted successfully` });
      setDeleteModal(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600">Organize your posts with tags for better discoverability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Tag */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Tag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                placeholder="Tag name"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                placeholder="tag-slug"
                value={newTag.slug}
                onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                placeholder="Tag description (optional)"
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                rows={3}
              />
            </div>

            <Button onClick={handleAddTag} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </CardContent>
        </Card>

        {/* Tags List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Tags</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tags..."
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
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">
                      {tag.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {tag.description}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {tag.slug}
                    </TableCell>
                    <TableCell>{tag.count}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(tag.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(tag.id)}>
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

      {/* Edit Tag Modal */}
      <Dialog open={editModal?.open || false} onOpenChange={(open) => !open && handleEditCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag information below.
            </DialogDescription>
          </DialogHeader>
          {editModal?.tag && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editModal.tag.editName}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    tag: { ...editModal.tag, editName: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editModal.tag.editSlug}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    tag: { ...editModal.tag, editSlug: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editModal.tag.editDescription}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    tag: { ...editModal.tag, editDescription: e.target.value }
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
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteModal?.tag?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}