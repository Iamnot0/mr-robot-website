import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/config';
import { useToast } from '../hooks/use-toast';
import { 
  Upload, 
  Link, 
  X, 
  Image as ImageIcon, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ThumbnailUpload = ({ value, onChange, disabled = false }) => {
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleUrlChange = (e) => {
    const url = e.target.value;
    onChange(url);
    
    if (url && url.startsWith('http')) {
      setPreview(url);
    } else {
      setPreview(null);
    }
  };
  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await fetch(`${API_ENDPOINTS.ARTICLES}/upload-thumbnail`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.data.path);
        // Set preview with full URL for display
        const fullUrl = result.data.path.startsWith('http') ? 
          result.data.path : 
          `${API_BASE_URL}${result.data.path}`;
        setPreview(fullUrl);
        toast({
          title: "Upload Successful",
          description: "Thumbnail uploaded successfully"
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload thumbnail",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Clear thumbnail
  const clearThumbnail = () => {
    onChange('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={uploadMode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('url')}
          disabled={disabled}
          className="flex items-center space-x-2"
        >
          <Link className="h-4 w-4" />
          <span>URL</span>
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('file')}
          disabled={disabled}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload File</span>
        </Button>
      </div>

      {/* URL Input */}
      {uploadMode === 'url' && (
        <div>
          <Label htmlFor="thumbnail-url">Thumbnail URL</Label>
          <Input
            id="thumbnail-url"
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            {value && value.startsWith('http') ? 
              '✅ Will be automatically downloaded and saved to our server' : 
              'Image URL for article thumbnail - will be auto-downloaded if it\'s a web URL'
            }
          </p>
        </div>
      )}

      {/* File Upload */}
      {uploadMode === 'file' && (
        <div>
          <Label>Upload Thumbnail</Label>
          <div
            className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-mr-cerulean bg-mr-cerulean/10' 
                : 'border-gray-300 hover:border-mr-cerulean/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-mr-cerulean" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative">
          <Label>Preview</Label>
          <div className="mt-1 relative inline-block">
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-32 h-24 object-cover rounded-lg border"
              onError={() => setPreview(null)}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={clearThumbnail}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <p className="text-xs text-green-600">Thumbnail ready</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {value && (
        <div className="flex items-center space-x-2 text-xs">
          {value.startsWith('http') ? (
            <>
              <AlertCircle className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600">External URL - will be downloaded automatically</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Local file - ready to use</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ThumbnailUpload;
