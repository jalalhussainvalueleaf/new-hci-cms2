'use client';

import { useState, useEffect, useCallback } from 'react';
import { slugify } from '@/lib/slugify';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, Upload, X, ImageIcon, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Dynamically import the MediaLibraryModal to avoid SSR issues
const MediaLibraryModal = dynamic(
  () => import('@/components/MediaLibraryModal'),
  { ssr: false }
);

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  // const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    slug: '',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    featuredImage: '',
    template: 'default',
    author: 'Admin',
    allowComments: true,
    tags: [],
    categories: []
  });

  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');


 // Fetch categories on component mount, but only if not already loaded
 useEffect(() => {
  if (categories.length === 0) {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }
}, [categories.length]);


  // Generate slug from title when title changes
  useEffect(() => {
    if (formData.title && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(prev.title)
      }));
    }
  }, [formData.title]);

    const handleInputChange = (field, value) => {
      
        if (field === 'title') {
          setFormData(prev => ({
            ...prev,
            slug: slugify(value)
          }));
        }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlugChange = (e) => {
    // Only auto-update slug if it hasn't been manually modified
    // or if it matches the auto-generated slug from the title
    const currentTitleSlug = slugify(formData.title);
    if (!formData.slug || formData.slug === currentTitleSlug) {
      const newSlug = slugify(e.target.value);
      handleInputChange('slug', newSlug);
    } else {
      // If user manually edited the slug, respect their changes
      handleInputChange('slug', e.target.value);
    }
  };
  
  // Update slug when title changes
  useEffect(() => {
    // Only auto-update slug if it hasn't been manually modified
    // or if it's empty
    if (formData.title && (!formData.slug || formData.slug === slugify(formData.title))) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(prev.title)
      }));
    }
  }, [formData.title]);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = newTag.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setNewTag('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };


  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name is required'
      });
      return;
    }

    // Generate slug from name if not provided
    const slug = newCategory.slug.trim() || newCategory.name.trim().toLowerCase().replace(/\s+/g, '-');
    
    try {
      setIsAddingCategory(true);
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCategory,
          slug
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add category');
      }

      // Update categories list
      setCategories(prev => [...prev, data.category]);
      
      // Set the new category as selected
      setFormData(prev => ({
        ...prev,
        category: data.category._id
      }));

      // Reset form and close modal
      setNewCategory({ name: '', slug: '', description: '' });
      setShowNewCategoryModal(false);
      
      toast({
        title: 'Success',
        description: 'Category added successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add category. Please try again.'
      });
    } finally {
      setIsAddingCategory(false);
    }
  };



  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      handleInputChange('featuredImage', data.files[0].url);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload image. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectImage = (imageUrl) => {
    handleInputChange('featuredImage', imageUrl);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    handleInputChange('featuredImage', '');
  };

  const handleSave = async (status) => {
    try {
      if (!formData.title.trim()) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Title is required'
        });
        return;
      }

      setLoading(true);
      const postData = {
        ...formData,
        status,
        updatedAt: new Date().toISOString(),
      };

      console.log(postData,"submitted data");
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }
      
      // Show success message
      const action = status === 'published' ? 'published' : 'saved';
      toast({
        title: 'Success',
        description: `Post "${data.post.title}" ${action} successfully!`,
        variant: 'success'
      });
      
      // If this was a publish action, redirect to posts list
      if (status === 'published') {
        router.push('/admin/posts');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save post. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600">Write and publish a new blog post</p>
        </div>
        <div className="flex space-x-3">
        <Link href="/admin/posts">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={() => handleSave('published')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  value={formData.slug || ''}
                  onChange={handleSlugChange}
                  className="mt-1"
                  // placeholder="Auto-generated from title"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={15}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of the post..."
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">SEO Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="SEO title for search engines..."
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO description for search engines..."
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

       <div className="space-y-6">
                 <Card>
                   <CardHeader>
                     <CardTitle>Publish</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                       <Label htmlFor="status">Status</Label>
                       <Select 
                         value={formData.status} 
                         onValueChange={(value) => handleSelectChange('status', value)}
                       >
                         <SelectTrigger className="w-[180px]">
                           <SelectValue placeholder="Select status" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="draft">Draft</SelectItem>
                           <SelectItem value="published">Published</SelectItem>
                           <SelectItem value="archived">Archived</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="flex items-center justify-between">
                       <Label htmlFor="featured">Featured</Label>
                       <div className="flex items-center space-x-2">
                         <Switch
                           id="featured"
                           checked={!!formData.featured}
                           onCheckedChange={(checked) => {
                             // console.log('Featured toggle changed to:', checked);
                             handleSelectChange('featured', checked);
                           }}
                         />
                         {/* <span className="text-sm text-muted-foreground">
                           {formData.featured ? 'Yes' : 'No'}
                         </span> */}
                       </div>
                     </div>
       
                  
                     
                         {/* <div className="flex items-center space-x-2">
                           <span className="text-sm font-medium">
                             {formData.featured ? 'Featured' : 'Not Featured'}
                           </span>
                           
                           {Boolean(formData.featured)}
                           <Switch
                             key={`featured-${formData.featured}`}
                             id="featured"
                             checked={Boolean(formData.featured)}
                             onCheckedChange={(checked) => {
                               // console.log('Featured toggle changed:', {
                               //   checked,
                               //   type: typeof checked,
                               //   currentState: formData.featured,
                               //   currentStateType: typeof formData.featured
                               // });
                               // Use handleSelectChange to update the state
                               handleSelectChange('featured', checked);
                             }}
                             onClick={(e) => {
                               // Prevent event bubbling to avoid any parent click handlers
                               e.stopPropagation();
                             }}
                             className={`${formData.featured ? 'bg-primary' : 'bg-muted'}`}
                           />
                           <span className="text-sm text-muted-foreground">
                             {formData.featured ? 'Featured' : 'Not Featured'}
                           </span>
                         </div> */}
                       {/* </div> */}
                     
                     <div className="flex items-center justify-between">
                       <Label htmlFor="allowComments">Allow Comments</Label>
                       <div className="flex items-center space-x-2">
                         <Switch
                           id="allowComments"
                           checked={!!formData.allowComments}
                           onCheckedChange={(checked) => {
                             // console.log('Allow Comments toggle changed to:', checked);
                             handleSelectChange('allowComments', checked);
                           }}
                         />
                         {/* <span className="text-sm text-muted-foreground">
                           {formData.allowComments ? 'Yes' : 'No'}
                         </span> */}
                       </div>
                     </div>
                     <div className="pt-4 space-y-2">
                       <div className="flex justify-between items-center">
                         <Label>Categories</Label>
                         <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
                           <DialogTrigger asChild>
                             <Button variant="ghost" size="sm" className="text-sm">
                               <Plus className="h-4 w-4 mr-1" /> Add New
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>Add New Category</DialogTitle>
                             </DialogHeader>
                             <form onSubmit={handleAddCategory} className="space-y-4">
                               <div className="space-y-2">
                                 <Label htmlFor="categoryName">Name *</Label>
                                 <Input
                                   id="categoryName"
                                   name="name"
                                   value={newCategory.name}
                                   onChange={handleNewCategoryChange}
                                   placeholder="Category name"
                                   required
                                 />
                               </div>
                               <div className="space-y-2">
                                 <Label htmlFor="categorySlug">Slug</Label>
                                 <Input
                                   id="categorySlug"
                                   name="slug"
                                   value={newCategory.slug}
                                   onChange={handleNewCategoryChange}
                                   placeholder="category-slug"
                                 />
                                 <p className="text-xs text-muted-foreground">Leave empty to auto-generate from name</p>
                               </div>
                               <div className="space-y-2">
                                 <Label htmlFor="categoryDescription">Description</Label>
                                 <Textarea
                                   id="categoryDescription"
                                   name="description"
                                   value={newCategory.description}
                                   onChange={handleNewCategoryChange}
                                   placeholder="Optional description"
                                   rows={3}
                                 />
                               </div>
                               <div className="flex justify-end space-x-2 pt-4">
                                 <DialogClose asChild>
                                   <Button type="button" variant="outline">Cancel</Button>
                                 </DialogClose>
                                 <Button type="submit" disabled={isAddingCategory}>
                                   {isAddingCategory ? 'Adding...' : 'Add Category'}
                                 </Button>
                               </div>
                             </form>
                           </DialogContent>
                         </Dialog>
                       </div>
                       <Select 
                         value={formData.category} 
                         onValueChange={(value) => handleSelectChange('category', value)}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select a category" />
                         </SelectTrigger>
                         <SelectContent>
                           {categories.map((category) => (
                             <SelectItem key={category._id} value={category._id}>
                               {category.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="tags">Tags</Label>
                       <div className="flex flex-wrap gap-2 mb-2">
                         {formData.tags.map((tag) => (
                           <Badge key={tag} className="flex items-center gap-1">
                             {tag}
                             <button 
                               type="button" 
                               onClick={() => removeTag(tag)}
                               className="ml-1 hover:text-red-500"
                             >
                               <X className="h-3 w-3" />
                             </button>
                           </Badge>
                         ))}
                       </div>
                       <Input
                         id="tags"
                         value={newTag}
                         onChange={(e) => setNewTag(e.target.value)}
                         onKeyDown={handleTagKeyDown}
                         onBlur={() => {
                           const tag = newTag.trim();
                           if (tag && !formData.tags.includes(tag)) {
                             setFormData(prev => ({
                               ...prev,
                               tags: [...prev.tags, tag]
                             }));
                             setNewTag('');
                           }
                         }}
                         placeholder="Add tags (press Enter or , to add)"
                       />
                     </div>
                   </CardContent>
                 </Card>
       
                 <Card>
                   <CardHeader>
                     <CardTitle>Featured Image</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image</Label>
                       <div 
                         className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                         onClick={() => setShowMediaLibrary(true)}
                       >
                         {/* {formData.featuredImage}  */}
                         {formData.featuredImage ? (
                    <div className="relative w-full h-48 rounded-md overflow-hidden group">
                      {formData.featuredImage} 
                             <img 
                               src={formData.featuredImage} 
                               alt="Featured" 
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
                               onClick={handleRemoveImage}
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center justify-center py-8 text-center">
                             <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                             <p className="text-sm text-gray-500">
                               Click to select a featured image
                             </p>
                             <p className="text-xs text-gray-400 mt-1">
                               Recommended size: 1200x630px
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
                               Select or Upload Image
                             </Button>
                           </div>
                         )}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
       
                
               </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <>
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={handleSelectImage}
          currentImage={formData.featuredImage}
          />
          
        </>
      )}
      <Toaster />
    </div>
  );
}
