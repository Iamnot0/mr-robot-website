import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  X
} from 'lucide-react';

const ContentEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const editorRef = useRef(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Format text functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  // Insert image function
  const insertImage = (url) => {
    if (url) {
      const img = `<img src="${url}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
      formatText('insertHTML', img);
    }
    setImageUrl('');
    setShowImageUpload(false);
  };

  // Drag and drop for images
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          insertImage(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  // Handle content change
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Save and restore cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreCursorPosition = (range) => {
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Initialize content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized && value) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Toolbar buttons
  const ToolbarButton = ({ onClick, children, title, active = false }) => (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {/* Text Formatting */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <ToolbarButton 
                onClick={() => formatText('bold')} 
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => formatText('italic')} 
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => formatText('underline')} 
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <ToolbarButton 
                onClick={() => formatText('insertUnorderedList')} 
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => formatText('insertOrderedList')} 
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Alignment */}
            <div className="flex gap-1 border-r pr-2 mr-2">
              <ToolbarButton 
                onClick={() => formatText('justifyLeft')} 
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => formatText('justifyCenter')} 
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => formatText('justifyRight')} 
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Links and Images */}
            <div className="flex gap-1">
              <ToolbarButton 
                onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) formatText('createLink', url);
                }} 
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => setShowImageUpload(!showImageUpload)} 
                title="Insert Image"
              >
                <Image className="h-4 w-4" />
              </ToolbarButton>
            </div>
          </div>

          {/* Image Upload Section */}
          {showImageUpload && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Insert Image</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageUpload(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => insertImage(imageUrl)}
                    disabled={!imageUrl}
                  >
                    Insert
                  </Button>
                </div>

                {/* Drag and Drop */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-sm text-blue-600">Drop the image here...</p>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Drag & drop an image here, or click to select
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="min-h-[300px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose prose-sm max-w-none"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        data-placeholder={placeholder}
      />
      
      {/* Placeholder styling */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ContentEditor;
