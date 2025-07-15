'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Posts about technology and innovation',
    count: 12,
    parent: null,
  },
  {
    id: 2,
    name: 'Development',
    slug: 'development',
    description: 'Web and software development articles',
    count: 8,
    parent: 'Technology',
  },
  {
    id: 3,
    name: 'Design',
    slug: 'design',
    description: 'UI/UX and graphic design content',
    count: 6,
    parent: null,
  },
  {
    id: 4,
    name: 'Business',
    slug: 'business',
    description: 'Business and entrepreneurship',
    count: 4,
    parent: null,
  },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    // Add category logic here
    console.log('Adding category:', newCategory);
    setNewCategory({ name: '', slug: '', description: '', parent: '' });
  };

  return (
    <div className="space-y-6">
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}