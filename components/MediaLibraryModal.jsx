'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Check } from 'lucide-react';

export default function MediaLibraryModal({ isOpen, onClose, onSelect, currentImage }) {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch media library
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchMedia = async () => {
      try {
        const response = await fetch('/api/media/list');
        const data = await response.json();
        if (data.success) {
          setMedia(data.files);
        }
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success && data.files?.[0]?.url) {
        // Add the new image to the media library
        setMedia(prev => [{
          url: data.files[0].url,
          key: data.files[0].key,
          name: file.name,
          size: file.size,
          lastModified: new Date().toISOString()
        }, ...prev]);
        
        // Auto-select the newly uploaded image
        setSelectedImage(data.files[0].url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Media Library</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Upload Area */}
          <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <label className="cursor-pointer">
              <div className="flex flex-col items-center justify-center py-4">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {isUploading 
                    ? `Uploading... ${uploadProgress}%` 
                    : 'Drag and drop files here, or click to select files'}
                </p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
            </label>
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((item) => (
                <div 
                  key={item.key} 
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === item.url ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(item.url)}
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover cursor-pointer hover:opacity-90"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  {selectedImage === item.url && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedImage}
            className={`px-4 py-2 rounded ${
              selectedImage 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
}
