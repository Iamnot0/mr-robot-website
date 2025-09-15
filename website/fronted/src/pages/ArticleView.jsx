import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
          // Debug external link
          console.log('🔍 Article loaded:', {
            title: data.data.title,
            external_link: data.data.external_link,
            has_content: !!data.data.content,
            content_length: data.data.content ? data.data.content.length : 0
          });
          // Scroll to top when article loads
          window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Smart function to detect platform and return appropriate button text
  const getExternalLinkText = (url) => {
    if (!url) return 'Read Full Article';
    
    const domain = url.toLowerCase();
    
    // Social Media Platforms
    if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'Read Article on Facebook';
    if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Read Article on X (Twitter)';
    if (domain.includes('linkedin.com')) return 'Read Article on LinkedIn';
    if (domain.includes('instagram.com')) return 'View on Instagram';
    if (domain.includes('tiktok.com')) return 'Watch on TikTok';
    
    // Content Platforms
    if (domain.includes('medium.com')) return 'Read Article on Medium';
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'Watch on YouTube';
    if (domain.includes('vimeo.com')) return 'Watch on Vimeo';
    
    // Development Platforms
    if (domain.includes('github.com')) return 'View on GitHub';
    if (domain.includes('gitlab.com')) return 'View on GitLab';
    if (domain.includes('bitbucket.org')) return 'View on Bitbucket';
    
    // Blog Platforms
    if (domain.includes('wordpress.com')) return 'Read Article on WordPress';
    if (domain.includes('blogspot.com') || domain.includes('blogger.com')) return 'Read Article on Blogger';
    if (domain.includes('substack.com')) return 'Read Article on Substack';
    
    // News Platforms
    if (domain.includes('reddit.com')) return 'View on Reddit';
    if (domain.includes('dev.to')) return 'Read Article on Dev.to';
    
    // Default for any other platform
    return 'Read Full Article';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Computer Science': 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-secondary',
      'Linux': 'bg-secondary/20 text-primary dark:bg-secondary/30 dark:text-secondary',
      'A+': 'bg-primary/15 text-primary dark:bg-primary/25 dark:text-secondary',
      'Network+': 'bg-secondary/30 text-primary dark:bg-secondary/40 dark:text-secondary',
      'Security+': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The article you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/knowledge')} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/knowledge')}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Knowledge
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => window.print()}
                className="text-primary-foreground hover:bg-primary-foreground/10"
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
            
            <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {article.description}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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
                  className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Content not available</p>
                  {article.external_link && (
                    <Button 
                      onClick={() => window.open(article.external_link, '_blank')}
                      className="mt-4 bg-primary hover:bg-primary/90"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {getExternalLinkText(article.external_link)}
                    </Button>
                  )}
                </div>
              )}
              
              {/* External Link at the end of article content */}
              {(() => {
                console.log('🔍 Button display check:', {
                  has_external_link: !!article.external_link,
                  has_content: !!article.content,
                  external_link: article.external_link,
                  should_show: !!(article.external_link && article.content)
                });
                return article.external_link && article.content;
              })() && (
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center justify-center">
                    <Button 
                      onClick={() => window.open(article.external_link, '_blank')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg font-semibold"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      {getExternalLinkText(article.external_link)}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Articles */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">More {article.category} Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
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
                  <p className="text-muted-foreground mb-4">
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
