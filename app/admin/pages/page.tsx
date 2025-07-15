'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

const pages = [
  {
    id: 1,
    title: 'About Us',
    status: 'published',
    author: 'Admin',
    date: '2024-01-10',
    template: 'Default',
  },
  {
    id: 2,
    title: 'Contact',
    status: 'published',
    author: 'Admin',
    date: '2024-01-08',
    template: 'Contact',
  },
  {
    id: 3,
    title: 'Privacy Policy',
    status: 'draft',
    author: 'Legal Team',
    date: '2024-01-15',
    template: 'Legal',
  },
  {
    id: 4,
    title: 'Services',
    status: 'published',
    author: 'Marketing',
    date: '2024-01-12',
    template: 'Services',
  },
];

const statusColors = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
};

export default function PagesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600">Manage your website pages</p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Page
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Pages</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pages..."
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
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[page.status as keyof typeof statusColors]}>
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{page.author}</TableCell>
                  <TableCell>{page.template}</TableCell>
                  <TableCell>{page.date}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
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
  );
}