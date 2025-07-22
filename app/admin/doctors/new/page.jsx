'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Upload, Plus, Minus, ImageIcon, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the MediaLibraryModal to avoid SSR issues
const MediaLibraryModal = dynamic(
  () => import('@/components/MediaLibraryModal'),
  { ssr: false }
);

export default function NewDoctorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [doctorCategories, setDoctorCategories] = useState([]);

  const [formData, setFormData] = useState({
    image: '',
    name: '',
    category: '',
    categoryId: '',
    qualification: [''],
    experience: '',
    rating: '',
    reviews: '',
    expertise: [''],
    publicationData: {
      heading: 'Publications',
      publications: ['']
    },
    researchData: {
      heading: 'Research',
      research: ['']
    },
    aboutData: {
      heading: 'About',
      about: ''
    },
    isVerified: false,
    isActive: true,
    isFeatured: false,
    reviewEnabled: false
  });

  // Fetch doctor categories on component mount
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleNestedArrayChange = (parent, field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: prev[parent][field].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addNestedArrayItem = (parent, field) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: [...prev[parent][field], '']
      }
    }));
  };

  const removeNestedArrayItem = (parent, field, index) => {
    if (formData[parent][field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: prev[parent][field].filter((_, i) => i !== index)
        }
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError('');
    setIsUploading(true);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormData(prev => ({
        ...prev,
        image: data.files[0].url
      }));
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
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
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Doctor name is required'
      });
      return;
    }

    if (!formData.experience.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Experience is required'
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create doctor');
      }
      
      toast({
        title: 'Success',
        description: `Doctor "${data.doctor.name}" created successfully!`,
        variant: 'success'
      });
      
      router.push('/admin/doctors');
    } catch (error) {
      console.error('Error creating doctor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create doctor. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Doctor</h1>
          <p className="text-gray-600">Create a new doctor profile</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/admin/doctors">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">Image</Label>
                <div 
                  className="mt-1 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setShowMediaLibrary(true)}
                >
                  {(formData.image || selectedFile) ? (
                    <div className="relative w-full h-48 rounded-md overflow-hidden group">
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image}
                        alt="Preview"
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
                        Click to select doctor image
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
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter doctor's full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => {
                    const selectedCategory = doctorCategories.find(cat => cat._id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      categoryId: value,
                      category: selectedCategory?.name || ''
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorCategories
                      .filter(cat => cat.isActive)
                      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
                      .map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {doctorCategories.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No categories available. Please create doctor categories first.
                  </p>
                )}
              </div>

              <div>
                <Label>Qualifications</Label>
                {formData.qualification.map((qual, index) => (
                  <div key={index} className="flex gap-2 mt-1">
                    <Input
                      value={qual}
                      onChange={(e) => handleArrayChange('qualification', index, e.target.value)}
                      placeholder="Enter qualification"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('qualification', index)}
                      disabled={formData.qualification.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('qualification')}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Qualification
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="experience">Experience *</Label>
                  <Input
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 10+ years"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reviews">Reviews Count</Label>
                  <Input
                    id="reviews"
                    name="reviews"
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={handleChange}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Areas of Expertise</Label>
                {formData.expertise.map((exp, index) => (
                  <div key={index} className="flex gap-2 mt-1">
                    <Input
                      value={exp}
                      onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                      placeholder="Enter area of expertise"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('expertise', index)}
                      disabled={formData.expertise.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('expertise')}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expertise
                </Button>
              </div>

              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={formData.aboutData.about}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    aboutData: { ...prev.aboutData, about: e.target.value }
                  }))}
                  placeholder="Write about the doctor..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.publicationData.publications.map((pub, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={pub}
                    onChange={(e) => handleNestedArrayChange('publicationData', 'publications', index, e.target.value)}
                    placeholder="Enter publication"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeNestedArrayItem('publicationData', 'publications', index)}
                    disabled={formData.publicationData.publications.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNestedArrayItem('publicationData', 'publications')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Publication
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.researchData.research.map((res, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={res}
                    onChange={(e) => handleNestedArrayChange('researchData', 'research', index, e.target.value)}
                    placeholder="Enter research work"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeNestedArrayItem('researchData', 'research', index)}
                    disabled={formData.researchData.research.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNestedArrayItem('researchData', 'research')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Research
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isVerified">Verified Doctor</Label>
                <Switch
                  id="isVerified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured Doctor</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reviewEnabled">Enable Reviews</Label>
                <Switch
                  id="reviewEnabled"
                  checked={formData.reviewEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reviewEnabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={loading || isUploading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Doctor
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>

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