'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  ArrowUpDown,
  Loader2
} from 'lucide-react';

// Dialog components
const Dialog = ({ open, onOpenChange, children }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
    <div className="relative z-50 bg-white rounded-lg w-full max-w-md p-6">
      {children}
    </div>
  </div>
);

const DialogHeader = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

const DialogContent = ({ children }) => (
  <div className="relative">
    {children}
  </div>
);

const statuses = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800' },
  archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-800' },
};

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Fetch pages from API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pages');
        if (response.ok) {
          const data = await response.json();
          setPages(data.pages || []);
        } else {
          throw new Error('Failed to fetch pages');
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load pages. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Handle page deletion
  const handleDelete = async () => {
    if (!pageToDelete) return;
    
    try {
      const response = await fetch(`/api/pages/${pageToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPages(pages.filter(page => page._id !== pageToDelete));
        toast({
          title: 'Success',
          description: 'Page deleted successfully',
          variant: 'success',
        });
      } else {
        throw new Error('Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete page. Please try again.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const sortedAndFilteredPages = [...pages]
    .filter(page => 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (page.excerpt && page.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
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
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search pages..."
              className="pl-9 w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button 
                  onClick={() => requestSort('title')} 
                  className="flex items-center hover:text-gray-900"
                >
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Author</TableHead>
              <TableHead>
                <button 
                  onClick={() => requestSort('status')} 
                  className="flex items-center hover:text-gray-900"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  onClick={() => requestSort('createdAt')} 
                  className="flex items-center hover:text-gray-900"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredPages.length > 0 ? (
              sortedAndFilteredPages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/admin/pages/edit/${page._id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {page.title}
                    </Link>
                  </TableCell>
                  <TableCell>{page.author || 'Admin'}</TableCell>
                  <TableCell>
                    <Badge className={statuses[page.status]?.color || 'bg-gray-100 text-gray-800'}>
                      {statuses[page.status]?.label || page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(page.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/pages/edit/${page._id}`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${page.slug}`} target="_blank" className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 cursor-pointer"
                          onClick={() => {
                            setPageToDelete(page._id);
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
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No pages match your search.' : 'No pages found. Create your first page to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this page? This action cannot be undone.
            </p>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
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
              Delete Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
