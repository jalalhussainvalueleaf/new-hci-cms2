'use client';

import { useState, useEffect, useCallback } from 'react';
import { slugify } from '@/lib/slugify';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save,Eye } from 'lucide-react';

export default function NewPagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPages, setLoadingPages] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    template: 'default',
    parentPage: null, // Changed from empty string to null
    menuOrder: 0,
    allowComments: false,
    featured: false,
    metaTitle: '',
    metaDescription: '',
    focusKeyword: ''
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
        if (data.pages && Array.isArray(data.pages)) {
          setPages(data.pages);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        // Optionally show error toast here
      } finally {
        setLoadingPages(false);
      }
    };
    
    fetchPages();
  }, []);

  // Generate slug from title when title changes and slug is empty
  // useEffect(() => {
  //   if (formData.title && !formData.slug) {
  //     setFormData(prev => ({
  //       ...prev,
  //       slug: slugify(prev.title)
  //     }));
  //   }
  // }, [formData.title]);

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

  const handleSlugChange = useCallback((e) => {
    const newSlug = slugify(e.target.value);
    handleInputChange('slug', newSlug);
  }, []);

  const handleTitleChange = (title) => {
    handleInputChange('title', title);
    if (!formData.slug) {
      handleInputChange('slug', slugify(title));
    }
  };

  // const handleSave = (status) => {
  //   const pageData = {
  //     ...formData,
  //     status,
  //     createdAt: new Date().toISOString(),
  //   };
  //   // console.log('Saving page:', pageData);
  //   // Here you would typically save to your backend
  // };

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
      
      const response = await fetch('/api/pages', {
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
        description: `Page "${data.page.title}" ${action} successfully!`,
        variant: 'success'
      });
      
      // If this was a publish action, redirect to posts list
      if (status === 'published') {
        router.push('/admin/pages');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <Link href="/admin/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Button>
          </Link> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Page</h1>
            <p className="text-gray-600">Create a new page for your website</p>
          </div>
        </div>
        <div className="flex space-x-2">
        <Link href="/admin/pages">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Button>
          </Link>
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {/* <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button> */}
          <Button onClick={() => handleSave('published')}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter page title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={handleSlugChange}
                  className="mt-1"
                  placeholder="Auto-generated from title"
                />
                {/* <p className="text-sm text-gray-500 mt-1">
                  URL: /pages/{formData.slug || 'page-slug'}
                </p> */}
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your page content here..."
                  className="mt-1 min-h-[300px]"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of the page..."
                  className="mt-1"
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
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template">Page Template</Label>
                <Select 
                  value={formData.template} 
                  onValueChange={(value) => handleInputChange('template', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="about">About</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parent">Parent Page</Label>
                <Select 
                  value={formData.parentPage ?? 'none'}
                  onValueChange={(value) => handleInputChange('parentPage', value === 'none' ? null : value)}
                  disabled={loadingPages}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingPages ? 'Loading pages...' : 'Select parent page (optional)'} />
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

              <div>
                <Label htmlFor="menuOrder">Menu Order</Label>
                <Input
                  id="menuOrder"
                  type="number"
                  value={formData.menuOrder}
                  onChange={(e) => handleInputChange('menuOrder', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="comments">Allow Comments</Label>
                <Switch
                  id="comments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Page</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
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
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="SEO description..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="focusKeyword">Focus Keyword</Label>
                <Input
                  id="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                  placeholder="Primary keyword..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
