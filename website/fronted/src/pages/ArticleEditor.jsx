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
import SimpleThumbnailUpload from '../components/SimpleThumbnailUpload';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [article, setArticle] = useState({
    title: '',
    description: '',
    content: '',
    external_link: '',
    thumbnail: '',
    category: 'Computer Science'
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchArticle();
    }
  }, [id, isEditing]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ARTICLES);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.articles) {
          // Get unique categories from articles, excluding placeholder articles
          const uniqueCategories = [...new Set(
            data.data.articles
              .filter(article => !article.title.startsWith('Category: '))
              .map(article => article.category)
          )];
          setCategories(uniqueCategories);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories(['Computer Science', 'Linux', 'A+', 'Network+', 'Security+']);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.ADMIN_ARTICLES}/${id}`, {
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
      
      const token = localStorage.getItem('adminToken');
      
      const articleData = {
        title: article.title,
        description: article.description,
        content: article.content || '',
        category: article.category || 'Computer Science',
        thumbnail_url: null,
        thumbnail_data: article.thumbnail || null,
        external_link: article.external_link || null,
        source: 'admin',
        is_published: true
      };

      const url = isEditing ? `${API_ENDPOINTS.ADMIN_ARTICLES}/${id}` : `${API_ENDPOINTS.ADMIN_ARTICLES}`;
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-primary-foreground hover:text-primary-foreground/80 active:text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-primary-foreground">
                  {isEditing ? 'Edit Article' : 'Create New Article'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!article.title || !article.description}
                className="bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/80"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !article.title || !article.description}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/80"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : (isEditing ? 'Update Article' : 'Create Article')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-primary border-primary">
              <CardHeader>
                <CardTitle className="text-primary-foreground">Article Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-primary-foreground">Title *</Label>
                  <Input
                    id="title"
                    value={article.title}
                    onChange={(e) => setArticle({...article, title: e.target.value})}
                    placeholder="Enter article title..."
                    className="mt-1 text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-primary-foreground">Description *</Label>
                  <textarea
                    id="description"
                    value={article.description}
                    onChange={(e) => setArticle({...article, description: e.target.value})}
                    placeholder="Brief description of the article..."
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-oxford-blue/30 rounded-md focus:outline-none focus:ring-2 focus:ring-oxford-blue focus:border-transparent text-oxford-blue placeholder:text-oxford-blue/70 bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-primary-foreground">Category</Label>
                    <Select
                      value={article.category}
                      onValueChange={(value) => setArticle({...article, category: value})}
                    >
                      <SelectTrigger className="mt-1 text-oxford-blue bg-white border-oxford-blue/30">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-oxford-blue/30">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-oxford-blue hover:bg-oxford-blue/10">
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
                    className="mt-1 text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to full article on Medium or other platforms
                  </p>
                </div>
                <div>
                  <Label>Thumbnail (Optional)</Label>
                  <SimpleThumbnailUpload
                    thumbnail={article.thumbnail}
                    onChange={(thumbnail) => setArticle({...article, thumbnail})}
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
