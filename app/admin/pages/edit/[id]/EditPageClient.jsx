'use client';

import { useState, useEffect, useCallback } from 'react';
import { slugify } from '@/lib/slugify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Eye, Upload, X ,ImageIcon} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

import dynamic from 'next/dynamic';

// Dynamically import the MediaLibraryModal to avoid SSR issues
const MediaLibraryModal = dynamic(
  () => import('@/components/MediaLibraryModal'),
  { ssr: false }
);


export default function EditPageClient({ pageId, page }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [alert, setAlert] = useState(null);
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  
  const [formData, setFormData] = useState({
    title: page?.title || '',
    content: page?.content || '',
    excerpt: page?.excerpt || '',
    status: page?.status || 'draft',
    slug: page?.slug || '',
    parent: null, // Use null for no parent
    featured: false,
    metaTitle: page?.metaTitle || '',
    metaDescription: page?.metaDescription || '',
    featuredImage: page?.featuredImage || '',
    template: 'default',
    author: 'Admin',
    allowComments: true,
    tags: [],
    categories: [],
    createdAt: new Date(),
    updatedAt: new Date()

  });

  // Fetch all pages for parent selection
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/pages`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch pages');
        }
        
        const data = await response.json();
        if (data.success && Array.isArray(data.pages)) {
          // Filter out the current page from the parent options
          const filteredPages = data.pages.filter(page => page._id !== pageId);
          setPages(filteredPages);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load pages for parent selection'
        });
      } finally {
        setLoadingPages(false);
      }
    };
    
    fetchPages();
  }, [pageId]);

  useEffect(() => {
    const fetchPageData = async () => {
      console.log('Fetching page data for ID:', pageId);
      try {
        console.log('Fetching page data for ID:', pageId);
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/pages/${pageId}`);

        console.log('Response received:', response);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch page: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.page) {
          throw new Error('Invalid page data received');
        }
        
        console.log('Page data received:', data.page);
        
        setFormData({
          title: data.page.title || '',
          content: data.page.content || '',
          excerpt: data.page.excerpt || '',
          status: data.page.status || 'draft',
          slug: data.page.slug || '',
          featured: data.page.featured || false,
          metaTitle: data.page.metaTitle || data.page.title || '',
          metaDescription: data.page.metaDescription || data.page.excerpt || '',
          featuredImage: data.page.featuredImage || '',
          template: data.page.template || 'default',
          author: data.page.author || 'Admin',
          allowComments: data.page.allowComments !== false, // Default to true if not set
          createdAt: data.page.createdAt ? new Date(data.page.createdAt) : new Date(),
          updatedAt: data.page.updatedAt ? new Date(data.page.updatedAt) : new Date()
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching page data:', error);
        setAlert({
          type: 'error',
          message: `Error loading page: ${error.message}`
        });
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [pageId]);



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

      setFormData(prev => ({
        ...prev,
        featuredImage: data.files[0].url
      }));
      
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleSelectImage = (imageUrl) => {
    console.log('Selected image URL:', imageUrl);
    setFormData(prev => ({
      ...prev,
      featuredImage: imageUrl
    }));
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    console.log('Removing featured image');
    setFormData(prev => ({
      ...prev,
      featuredImage: ''
    }));
  };

 


  // Generate slug from title when title changes and slug is empty
  // useEffect(() => {
  //         if (field === 'title') {
  //              console.log('title changed', slugify(value));
  //            setFormData(prev => ({
  //              ...prev,
  //              slug: slugify(value)
  //            }));
  //          }
  // }, [formData.title]);

  const handleInputChange = (field, value) => {
    if (field === 'title') {
      console.log('title changed', slugify(value));
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
    const newSlug = slugify(e.target.value);
    handleInputChange('slug', newSlug);
  };

  const handleSave = async (status) => {
    try {
      setLoading(true);
      
      // Ensure parent is set to null if empty string
      const pageData = {
        ...formData,
        parent: formData.parent || null,
        status: status || formData.status,
        updatedAt: new Date()
      };

      // Use the base URL from environment variables
      const baseUrl = process.env.NEXTAUTH_URL || '';
      console.log('base url',process.env.NEXTAUTH_URL)
      const response = await fetch(`${baseUrl}/api/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error('Failed to update page');
      }   
      
      // Update the form with the latest data
      if (responseData.page) {
      // Show success message
      const action = status === 'published' ? 'published' : 'saved';
      toast({
        title: 'Success',
        description: `Page "${responseData.page.title}" ${action} successfully!`,
        variant: 'success'
      });
      
        setFormData(prev => ({
          ...prev,
          ...responseData.page,
          updatedAt: new Date()
        }));

     // If this was a publish action, redirect to posts list
     if (status === 'published') {
      router.push('/admin/pages');
    }


      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save post. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    handleSave('published');
  };

  const handleDraft = () => {
    handleSave('draft');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* <Link href="/admin/pages" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pages
          </Link> */}
          <h1 className="text-2xl font-bold mt-2">Edit Page</h1>
        </div>
        <div className="space-x-2 flex items-center">
            <Link href="/admin/pages">
                      <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Pages
                      </Button>
                    </Link>
          <Button 
            variant="outline" 
            onClick={handleDraft}
            disabled={loading}
          >
            Save Draft
          </Button>
          <Button 
            onClick={handlePublish}
            disabled={loading}
          >
            Publish
          </Button>
        </div>
      </div>

      {/* {alert && (
        <Alert className={`mb-6 ${alert.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )} */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter page title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={handleSlugChange}
                  className="mt-1"
                  placeholder="Auto-generated from title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your page content here..."
                  rows={10}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="A short excerpt for your page (optional)"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="Enter meta title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="Enter meta description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowComments">Allow Comments</Label>
                <Switch
                  id="allowComments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={formData.template}
                  onValueChange={(value) => handleInputChange('template', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Template</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="sidebar-left">Sidebar Left</SelectItem>
                    <SelectItem value="sidebar-right">Sidebar Right</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Page</Label>
                <Select
                  value={formData.parent ?? 'none'}
                  onValueChange={(value) => handleInputChange('parent', value === 'none' ? null : value)}
                  disabled={loadingPages}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent page (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">(No parent) - Top Level Page</SelectItem>
                    {pages.map((page) => (
                      <SelectItem key={page._id} value={page._id}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(formData.tags) && formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-400 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card> */}

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
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={handleSelectImage}
          currentImage={formData.featuredImage}
        />
      )}
    </div>
  );
}
