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
  X,
  Eraser
} from 'lucide-react';

const ContentEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const editorRef = useRef(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced format text functions with proper keyboard shortcut handling
  const formatText = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Use modern Selection API instead of deprecated execCommand
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        switch (command) {
          case 'bold':
            toggleBold();
            break;
          case 'italic':
            toggleItalic();
            break;
          case 'underline':
            toggleUnderline();
            break;
          case 'insertUnorderedList':
            toggleUnorderedList();
            break;
          case 'insertOrderedList':
            toggleOrderedList();
            break;
          case 'justifyLeft':
            setAlignment('left');
            break;
          case 'justifyCenter':
            setAlignment('center');
            break;
          case 'justifyRight':
            setAlignment('right');
            break;
          case 'createLink':
            if (value) createLink(value);
            break;
          case 'insertHTML':
            if (value) insertHTML(value);
            break;
          default:
            // Fallback to execCommand for other commands
    document.execCommand(command, false, value);
        }
      }
    }
  };

  // Toggle bold formatting
  const toggleBold = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
      
      if (element.tagName === 'B' || element.tagName === 'STRONG') {
        // Remove bold
        const text = element.textContent;
        const newText = document.createTextNode(text);
        element.parentNode.replaceChild(newText, element);
      } else {
        // Add bold
        const boldElement = document.createElement('strong');
        try {
          range.surroundContents(boldElement);
        } catch (e) {
          // If surroundContents fails, use extractContents
          const contents = range.extractContents();
          boldElement.appendChild(contents);
          range.insertNode(boldElement);
        }
      }
    }
    handleContentChange();
  };

  // Toggle italic formatting
  const toggleItalic = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
      
      if (element.tagName === 'I' || element.tagName === 'EM') {
        // Remove italic
        const text = element.textContent;
        const newText = document.createTextNode(text);
        element.parentNode.replaceChild(newText, element);
      } else {
        // Add italic
        const italicElement = document.createElement('em');
        try {
          range.surroundContents(italicElement);
        } catch (e) {
          // If surroundContents fails, use extractContents
          const contents = range.extractContents();
          italicElement.appendChild(contents);
          range.insertNode(italicElement);
        }
      }
    }
    handleContentChange();
  };

  // Toggle underline formatting
  const toggleUnderline = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
      
      if (element.tagName === 'U') {
        // Remove underline
        const text = element.textContent;
        const newText = document.createTextNode(text);
        element.parentNode.replaceChild(newText, element);
      } else {
        // Add underline
        const underlineElement = document.createElement('u');
        try {
          range.surroundContents(underlineElement);
        } catch (e) {
          // If surroundContents fails, use extractContents
          const contents = range.extractContents();
          underlineElement.appendChild(contents);
          range.insertNode(underlineElement);
        }
      }
    }
    handleContentChange();
  };

  // Toggle unordered list
  const toggleUnorderedList = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const listItem = container.closest('li');
      const list = container.closest('ul');
      
      if (list) {
        // Convert list items to paragraphs
        const listItems = list.querySelectorAll('li');
        listItems.forEach(li => {
          const p = document.createElement('p');
          p.innerHTML = li.innerHTML;
          list.parentNode.insertBefore(p, list);
        });
        list.remove();
      } else {
        // Create unordered list
        const ul = document.createElement('ul');
        const li = document.createElement('li');
        
        if (range.collapsed) {
          li.innerHTML = '&nbsp;';
        } else {
          const contents = range.extractContents();
          li.appendChild(contents);
        }
        
        ul.appendChild(li);
        range.insertNode(ul);
        
        // Move cursor inside the list item
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    handleContentChange();
  };

  // Toggle ordered list
  const toggleOrderedList = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const listItem = container.closest('li');
      const list = container.closest('ol');
      
      if (list) {
        // Convert list items to paragraphs
        const listItems = list.querySelectorAll('li');
        listItems.forEach(li => {
          const p = document.createElement('p');
          p.innerHTML = li.innerHTML;
          list.parentNode.insertBefore(p, list);
        });
        list.remove();
      } else {
        // Create ordered list
        const ol = document.createElement('ol');
        const li = document.createElement('li');
        
        if (range.collapsed) {
          li.innerHTML = '&nbsp;';
        } else {
          const contents = range.extractContents();
          li.appendChild(contents);
        }
        
        ol.appendChild(li);
        range.insertNode(ol);
        
        // Move cursor inside the list item
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    handleContentChange();
  };

  // Set text alignment
  const setAlignment = (alignment) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const blockElement = container.closest('p, div, h1, h2, h3, h4, h5, h6, li');
      
      if (blockElement) {
        blockElement.style.textAlign = alignment;
      } else {
        // Create a div with alignment
        const div = document.createElement('div');
        div.style.textAlign = alignment;
        
        if (range.collapsed) {
          div.innerHTML = '&nbsp;';
        } else {
          const contents = range.extractContents();
          div.appendChild(contents);
        }
        
        range.insertNode(div);
      }
    }
    handleContentChange();
  };

  // Create link
  const createLink = (url) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      try {
        range.surroundContents(link);
      } catch (e) {
        const contents = range.extractContents();
        link.appendChild(contents);
        range.insertNode(link);
      }
    }
    handleContentChange();
  };

  // Insert HTML
  const insertHTML = (html) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      range.deleteContents();
      range.insertNode(fragment);
    }
    handleContentChange();
  };

  // Clear formatting
  const clearFormatting = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const contents = range.extractContents();
      
      // Remove all formatting tags but keep the text
      const walker = document.createTreeWalker(
        contents,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );
      
      const elementsToProcess = [];
      let node;
      while (node = walker.nextNode()) {
        elementsToProcess.push(node);
      }
      
      elementsToProcess.forEach(element => {
        // Remove formatting tags but keep content
        if (['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span', 'font'].includes(element.tagName.toLowerCase())) {
          const parent = element.parentNode;
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
        }
      });
      
      range.insertNode(contents);
      
      // Clear any inline styles
      const textNodes = [];
      const textWalker = document.createTreeWalker(
        contents,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let textNode;
      while (textNode = textWalker.nextNode()) {
        textNodes.push(textNode);
      }
      
      textNodes.forEach(textNode => {
        if (textNode.parentElement) {
          textNode.parentElement.style.cssText = '';
        }
      });
    }
    handleContentChange();
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

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Prevent browser default shortcuts when Ctrl/Cmd is pressed
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'l':
          e.preventDefault();
          formatText('createLink', prompt('Enter URL:'));
          break;
        case 'a':
          // Allow Select All (Ctrl+A)
          break;
        case 'c':
          // Allow Copy (Ctrl+C)
          break;
        case 'x':
          // Allow Cut (Ctrl+X)
          break;
        case 'v':
          // Allow Paste (Ctrl+V)
          break;
        case 'z':
          // Allow undo/redo
          break;
        case 'y':
          // Allow redo
          break;
        case 's':
          // Allow save
          break;
        default:
          // Prevent other browser shortcuts
          e.preventDefault();
          break;
      }
    }
    
    // Handle Backspace key in lists
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const listItem = container.closest('li');
        const list = container.closest('ul, ol');
        
        if (listItem && range.collapsed && range.startOffset === 0) {
          // If at the beginning of a list item, convert to paragraph
          e.preventDefault();
          
          const p = document.createElement('p');
          p.innerHTML = listItem.innerHTML;
          
          if (listItem.previousSibling) {
            listItem.parentNode.insertBefore(p, listItem);
          } else {
            listItem.parentNode.insertBefore(p, list);
          }
          
          // If this was the only item in the list, remove the list
          if (list.children.length === 1) {
            list.remove();
          } else {
            listItem.remove();
          }
          
          // Move cursor to the new paragraph
          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          
          handleContentChange();
        }
      }
    }
    
    // Handle Enter key in lists
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const listItem = container.closest('li');
        
        if (listItem) {
          e.preventDefault();
          
          // Create new list item
          const newLi = document.createElement('li');
          newLi.innerHTML = '&nbsp;';
          
          if (listItem.nextSibling) {
            listItem.parentNode.insertBefore(newLi, listItem.nextSibling);
          } else {
            listItem.parentNode.appendChild(newLi);
          }
          
          // Move cursor to new list item
          const newRange = document.createRange();
          newRange.setStart(newLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
    
    // Handle Delete key in lists
    if (e.key === 'Delete') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const listItem = container.closest('li');
        const list = container.closest('ul, ol');
        
        if (listItem && range.collapsed && range.startOffset === listItem.textContent.length) {
          // If at the end of a list item, merge with next item or convert to paragraph
          e.preventDefault();
          
          const nextItem = listItem.nextSibling;
          if (nextItem && nextItem.tagName === 'LI') {
            // Merge with next list item
            listItem.innerHTML += nextItem.innerHTML;
            nextItem.remove();
          } else {
            // Convert to paragraph
            const p = document.createElement('p');
            p.innerHTML = listItem.innerHTML;
            
            if (listItem.nextSibling) {
              listItem.parentNode.insertBefore(p, listItem.nextSibling);
            } else {
              listItem.parentNode.appendChild(p);
            }
            
            // If this was the only item in the list, remove the list
            if (list.children.length === 1) {
              list.remove();
            } else {
              listItem.remove();
            }
            
            // Move cursor to the new paragraph
            const newRange = document.createRange();
            newRange.setStart(p, p.textContent.length);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
          
          handleContentChange();
        }
      }
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
              <ToolbarButton 
                onClick={clearFormatting} 
                title="Clear Formatting"
              >
                <Eraser className="h-4 w-4" />
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
                      ? 'border-primary bg-muted' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-sm text-primary">Drop the image here...</p>
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
        onKeyDown={handleKeyDown}
        className="min-h-[300px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent prose prose-sm max-w-none whitespace-pre-wrap break-words"
        data-placeholder={placeholder}
      />
      
    </div>
  );
};

export default ContentEditor;
