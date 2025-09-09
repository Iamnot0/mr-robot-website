import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../hooks/use-toast';
import { API_ENDPOINTS } from '../utils/config';
import ContentEditor from '../components/ContentEditor';
import ThumbnailUpload from '../components/ThumbnailUpload';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbnailProcessing, setThumbnailProcessing] = useState(false);
  const [article, setArticle] = useState({
    title: '',
    description: '',
    content: '',
    external_link: '',
    thumbnail: '',
    category: 'Computer Science'
  });

  const categories = [
    'Computer Science',
    'Linux',
    'A+',
    'Network+',
    'Security+'
  ];

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
  }, [id, isEditing]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.ARTICLES}/id/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setArticle({
            title: data.data.title || '',
            description: data.data.description || '',
            content: data.data.content || '',
            external_link: data.data.external_link || '',
            thumbnail: data.data.thumbnail_url || '',
            category: data.data.category || 'Computer Science'
          });
        }
      } else {
        throw new Error('Failed to fetch article');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive"
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!article.title.trim() || !article.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      setThumbnailProcessing(article.thumbnail && article.thumbnail.startsWith('http'));
      
      const token = localStorage.getItem('adminToken');
      
      const articleData = {
        title: article.title,
        description: article.description,
        content: article.content || '',
        category: article.category || 'Computer Science',
        thumbnail_url: article.thumbnail || null,
        external_link: article.external_link || null,
        source: 'admin',
        is_published: true
      };

      const url = isEditing ? `${API_ENDPOINTS.ARTICLES}/${id}` : API_ENDPOINTS.ARTICLES;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.data && result.data.thumbnail_url) {
          setArticle(prev => ({ ...prev, thumbnail: result.data.thumbnail_url }));
        }
        
        toast({
          title: "Success",
          description: isEditing ? "Article updated successfully" : "Article created successfully"
        });
        navigate('/admin');
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} article`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} article`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setThumbnailProcessing(false);
    }
  };

  const handlePreview = () => {
    const previewArticle = {
      ...article,
      slug: 'preview',
      id: 'preview',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    sessionStorage.setItem('previewArticle', JSON.stringify(previewArticle));
    window.open('/article/preview', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-mr-cerulean" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b" style={{backgroundColor: '#1F2E3F'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-white hover:text-white/80 active:text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {isEditing ? 'Edit Article' : 'Create New Article'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!article.title || !article.description}
                className="bg-white text-gray-800 border-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !article.title || !article.description}
                className="bg-white text-gray-800 hover:bg-gray-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? (
                  thumbnailProcessing ? 'Downloading thumbnail...' : 'Saving...'
                ) : (
                  isEditing ? 'Update Article' : 'Create Article'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-mr-cerulean border-mr-cerulean-dark">
              <CardHeader>
                <CardTitle className="text-white">Article Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    value={article.title}
                    onChange={(e) => setArticle({...article, title: e.target.value})}
                    placeholder="Enter article title..."
                    className="mt-1 text-white placeholder:text-white/70 bg-white/10 border-white/30"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">Description *</Label>
                  <textarea
                    id="description"
                    value={article.description}
                    onChange={(e) => setArticle({...article, description: e.target.value})}
                    placeholder="Brief description of the article..."
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder:text-white/70 bg-white/10"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-white">Category</Label>
                    <Select
                      value={article.category}
                      onValueChange={(value) => setArticle({...article, category: value})}
                    >
                      <SelectTrigger className="mt-1 text-white bg-white/10 border-white/30">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <p className="text-sm text-gray-600">
                  Write your article content with rich formatting, images, and links
                </p>
              </CardHeader>
              <CardContent>
                <ContentEditor
                  value={article.content}
                  onChange={(content) => setArticle({...article, content})}
                  placeholder="Start writing your article content here... You can drag and drop images, format text, create lists, and add links!"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">External Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="external_link">External Link (Optional)</Label>
                  <Input
                    id="external_link"
                    type="url"
                    value={article.external_link}
                    onChange={(e) => setArticle({...article, external_link: e.target.value})}
                    placeholder="https://medium.com/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to full article on Medium or other platforms
                  </p>
                </div>
                <div>
                  <Label>Thumbnail (Optional)</Label>
                  <ThumbnailUpload
                    value={article.thumbnail}
                    onChange={(thumbnail) => setArticle({...article, thumbnail})}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publishing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Published</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span className="text-gray-900">Admin</span>
                  </div>
                  {isEditing && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
