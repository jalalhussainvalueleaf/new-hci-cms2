'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Star,
  Shield,
  Award,
  Loader2,
  Settings
} from 'lucide-react';

const categoryLabels = {
  // This will be populated from the database
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export default function DoctorsPage() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [doctorCategories, setDoctorCategories] = useState([]);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/doctors');
        if (response.ok) {
          const data = await response.json();
          setDoctors(data.doctors || []);
        } else {
          throw new Error('Failed to fetch doctors');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load doctors. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch doctor categories
  useEffect(() => {
    const fetchDoctorCategories = async () => {
      try {
        const response = await fetch('/api/doctor-categories');
        if (response.ok) {
          const data = await response.json();
          setDoctorCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching doctor categories:', error);
      }
    };

    fetchDoctorCategories();
  }, []);

  // Handle doctor deletion
  const handleDelete = async () => {
    if (!doctorToDelete) return;
    
    try {
      const response = await fetch(`/api/doctors/${doctorToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDoctors(doctors.filter(doctor => doctor._id !== doctorToDelete));
        toast({
          title: 'Success',
          description: 'Doctor deleted successfully',
          variant: 'success',
        });
      } else {
        throw new Error('Failed to delete doctor');
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete doctor. Please try again.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDoctorToDelete(null);
    }
  };

  // Apply filtering
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.category && doctor.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doctor.expertise && doctor.expertise.some(exp => 
      exp.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Helper function to get category display name
  const getCategoryDisplay = (doctor) => {
    if (doctor.categoryId) {
      const category = doctorCategories.find(cat => cat._id === doctor.categoryId);
      return category ? category.name : doctor.category || 'Unknown';
    }
    return doctor.category || 'Unknown';
  };

  // Helper function to get category color
  const getCategoryColor = (doctor) => {
    if (doctor.categoryId) {
      const category = doctorCategories.find(cat => cat._id === doctor.categoryId);
      return category?.color || '#3B82F6';
    }
    return '#3B82F6';
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600">Manage doctor profiles and information</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/admin/doctor-categories">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
          </Link>
          <Link href="/admin/doctors/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Doctor
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{doctors.length}</div>
            <p className="text-xs text-muted-foreground">Total Doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {doctors.filter(doctor => doctor.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {doctors.filter(doctor => doctor.isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">Verified Doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {doctors.filter(doctor => doctor.isFeatured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured Doctors</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Doctors</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search doctors..."
                className="pl-9 w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {doctor.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium flex items-center">
                            {doctor.name}
                            {doctor.isVerified && (
                              <Shield className="h-4 w-4 ml-1 text-blue-500" />
                            )}
                            {doctor.isFeatured && (
                              <Star className="h-4 w-4 ml-1 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.qualification && doctor.qualification.filter(q => q).join(', ')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: getCategoryColor(doctor),
                          color: getCategoryColor(doctor)
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getCategoryColor(doctor) }}
                          />
                          <span>{getCategoryDisplay(doctor)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{doctor.experience}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{doctor.rating || 0}</span>
                        <span className="text-gray-500 ml-1">({doctor.reviews || 0})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={doctor.isActive ? statusColors.active : statusColors.inactive}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/doctors/edit/${doctor._id}`} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/doctors/${doctor._id}`} target="_blank" className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer"
                            onClick={() => {
                              setDoctorToDelete(doctor._id);
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
                    {searchTerm ? 'No doctors match your search.' : 'No doctors found. Add your first doctor to get started.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this doctor? This action cannot be undone.
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
              Delete Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}