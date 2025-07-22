'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Upload,
  X,
  ImageIcon,
  Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the MediaLibraryModal to avoid SSR issues
const MediaLibraryModal = dynamic(
  () => import('@/components/MediaLibraryModal'),
  { ssr: false }
);

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export default function TestimonialsPage() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    content: '',
    image: '',
    rating: 5,
    status: 'active',
    featured: false
  });

  const [editingTestimonial, setEditingTestimonial] = useState(null);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.testimonials || []);
        } else {
          throw new Error('Failed to fetch testimonials');
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load testimonials. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      content: '',
      image: '',
      rating: 5,
      status: 'active',
      featured: false
    });
    setEditingTestimonial(null);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image selection from media library
  const handleSelectImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
    setShowMediaLibrary(false);
  };

  // Handle form submission (both add and edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Name, title, and content are required fields.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingTestimonial 
        ? `/api/testimonials/${editingTestimonial._id}`
        : '/api/testimonials';
      
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save testimonial');
      }

      toast({
        title: 'Success',
        description: `Testimonial ${editingTestimonial ? 'updated' : 'created'} successfully!`,
        variant: 'success',
      });

      // Refresh testimonials list
      const refreshResponse = await fetch('/api/testimonials');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setTestimonials(refreshData.testimonials || []);
      }

      // Close dialog and reset form
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      resetForm();

    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save testimonial. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (testimonial) => {
    setFormData({
      name: testimonial.name || '',
      title: testimonial.title || '',
      content: testimonial.content || '',
      image: testimonial.image || '',
      rating: testimonial.rating || 5,
      status: testimonial.status || 'active',
      featured: testimonial.featured || false
    });
    setEditingTestimonial(testimonial);
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!testimonialToDelete) return;
    
    try {
      const response = await fetch(`/api/testimonials/${testimonialToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTestimonials(testimonials.filter(testimonial => testimonial._id !== testimonialToDelete));
        toast({
          title: 'Success',
          description: 'Testimonial deleted successfully',
          variant: 'success',
        });
      } else {
        throw new Error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete testimonial. Please try again.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    }
  };

  // Apply filtering
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || testimonial.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Testimonial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{testimonials.length}</div>
            <p className="text-xs text-muted-foreground">Total Testimonials</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testimonials.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testimonials.filter(t => t.featured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testimonials.length > 0 
                ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Testimonials</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search testimonials..."
                  className="pl-9 w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestimonials.length > 0 ? (
                filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {testimonial.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{testimonial.name}</div>
                          {testimonial.featured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{testimonial.title}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{testimonial.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{testimonial.rating || 5}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[testimonial.status] || statusColors.active}>
                        {testimonial.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(testimonial)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setTestimonialToDelete(testimonial._id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No testimonials match your search.' : 'No testimonials found. Add your first testimonial to get started.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Testimonial Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setAddDialogOpen(false);
          setEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial 
                ? 'Update the testimonial information below.'
                : 'Fill in the details to create a new testimonial.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="title">Title/Position *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="CEO, Company Name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Testimonial Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write the testimonial content here..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label>Customer Photo</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowMediaLibrary(true)}
              >
                {formData.image ? (
                  <div className="relative w-full h-32 rounded-md overflow-hidden group">
                    <img 
                      src={formData.image} 
                      alt="Customer" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMediaLibrary(true);
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputChange('image', '');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to select customer photo
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMediaLibrary(true);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Select 
                  value={formData.rating.toString()} 
                  onValueChange={(value) => handleInputChange('rating', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured Testimonial</Label>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setAddDialogOpen(false);
                  setEditDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingTestimonial ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={handleSelectImage}
          currentImage={formData.image}
        />
      )}
    </div>
  );
}