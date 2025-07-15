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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const tags = [
  {
    id: 1,
    name: 'JavaScript',
    slug: 'javascript',
    description: 'Posts about JavaScript programming',
    count: 15,
  },
  {
    id: 2,
    name: 'React',
    slug: 'react',
    description: 'React framework and library content',
    count: 12,
  },
  {
    id: 3,
    name: 'Next.js',
    slug: 'nextjs',
    description: 'Next.js framework tutorials and guides',
    count: 8,
  },
  {
    id: 4,
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript language and best practices',
    count: 10,
  },
  {
    id: 5,
    name: 'CSS',
    slug: 'css',
    description: 'Styling and CSS-related content',
    count: 7,
  },
  {
    id: 6,
    name: 'UI/UX',
    slug: 'ui-ux',
    description: 'User interface and experience design',
    count: 5,
  },
];

export default function TagsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTag = () => {
    // Add tag logic here
    console.log('Adding tag:', newTag);
    setNewTag({ name: '', slug: '', description: '' });
  };

  return (
    <div className="space-y-6">
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