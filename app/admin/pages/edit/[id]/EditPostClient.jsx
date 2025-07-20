'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';

export default function EditPostClient({ pageId, page }) {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    category: '',
    tags: [],
    featured: false,
    allowComments: true,
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        content: page.content || '',
        excerpt: page.excerpt || '',
        status: page.status || 'draft',
        category: page.category || '',
        tags: page.tags || [],
        featured: page.featured || false,
        allowComments: page.allowComments !== false, // Default to true if not set
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
      });
    }
    setLoading(false);
  }, [page]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = (status) => {
    const postData = {
      ...formData,
      status: status || formData.status,
    };

    // Add save logic here
    console.log('Saving post:', postData);
    
    // Example API call (uncomment and implement as needed)
    /*
    fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
      setAlert({
        type: 'success',
        message: 'Page updated successfully!'
      });
    })
    .catch(error => {
      console.error('Error updating page:', error);
      setAlert({
        type: 'error',
        message: 'Failed to update page. Please try again.'
      });
    });
    */
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
          <Link href="/admin/pages" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pages
          </Link>
          <h1 className="text-2xl font-bold mt-2">Edit Page</h1>
        </div>
        <div className="space-x-2">
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

      {alert && (
        <Alert className={`mb-6 ${alert.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

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
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
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
            </CardContent>
          </Card>

          <Card>
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
                  {formData.tags.map((tag) => (
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
      </div>
    </div>
  );
}
