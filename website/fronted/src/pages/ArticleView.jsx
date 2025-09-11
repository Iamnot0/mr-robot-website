import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Share2, 
  BookOpen,
  Clock,
  ExternalLink
} from 'lucide-react';
import { API_ENDPOINTS } from '../utils/config';

const ArticleView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.ARTICLES}/${slug}`);
        
        if (!response.ok) {
          throw new Error('Article not found');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setArticle(data.data);
        } else {
          throw new Error('Failed to load article');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Computer Science': 'bg-blue-100 text-blue-800',
      'Linux': 'bg-green-100 text-green-800',
      'A+': 'bg-purple-100 text-purple-800',
      'Network+': 'bg-orange-100 text-orange-800',
      'Security+': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mr-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mr-cerulean border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mr-charcoal/70">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-mr-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-mr-charcoal/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-mr-charcoal mb-4">Article Not Found</h1>
          <p className="text-mr-charcoal/70 mb-6">{error || 'The article you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/knowledge')} className="bg-mr-cerulean hover:bg-mr-cerulean">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mr-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-mr-charcoal to-mr-charcoal-dark text-mr-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/knowledge')}
                className="text-mr-white hover:bg-mr-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Knowledge
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => window.print()}
                className="text-mr-white hover:bg-mr-white/10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className={`${getCategoryColor(article.category)} border-0`}>
                <Tag className="h-3 w-3 mr-1" />
                {article.category}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-mr-charcoal mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-mr-charcoal/80 mb-6 leading-relaxed">
              {article.description}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-mr-charcoal/60">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Published {formatDate(article.published_at || article.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>MR-ROBOT</span>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {article.content ? (
                <div 
                  className="prose prose-lg max-w-none text-mr-charcoal"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-mr-charcoal/30 mx-auto mb-4" />
                  <p className="text-mr-charcoal/70">Content not available</p>
                  {article.external_link && (
                    <Button 
                      onClick={() => window.open(article.external_link, '_blank')}
                      className="mt-4 bg-mr-cerulean hover:bg-mr-cerulean"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read Full Article
                    </Button>
                  )}
                </div>
              )}
              
              {/* Medium Link at the end of article content */}
              {article.external_link && article.content && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <Button 
                      onClick={() => window.open(article.external_link, '_blank')}
                      className="bg-mr-cerulean hover:bg-mr-cerulean-dark text-white px-6 py-3"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read Article on Medium
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Articles */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-mr-charcoal mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">More {article.category} Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-mr-charcoal/70 mb-4">
                    Explore more articles in the {article.category} category
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/knowledge?category=${article.category.toLowerCase().replace('+', '-plus').replace(' ', '-')}`)}
                    className="w-full"
                  >
                    View All {article.category} Articles
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">Browse All Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-mr-charcoal/70 mb-4">
                    Discover more knowledge across all categories
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/knowledge')}
                    className="w-full"
                  >
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
