import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const SimpleThumbnailUpload = ({ thumbnail, onChange, className = "" }) => {
  const [preview, setPreview] = useState(thumbnail || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setPreview(base64);
      onChange(base64); // Pass base64 directly to parent
      toast({
        title: "Image Selected",
        description: "Thumbnail ready for upload"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    toast({
      title: "Thumbnail Removed",
      description: "Thumbnail has been removed"
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-primary-foreground">
          Article Thumbnail
        </label>
        <p className="text-xs text-primary-foreground/70">
          Drag & drop an image or click to select (max 5MB)
        </p>
      </div>

      {preview ? (
        <Card className="bg-primary border-primary">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview}
                alt="Thumbnail preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`bg-primary border-primary cursor-pointer transition-colors ${
            isDragging ? 'border-primary-foreground' : ''
          }`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-primary-foreground/10">
                <Upload className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-primary-foreground font-medium">
                  {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default SimpleThumbnailUpload;
