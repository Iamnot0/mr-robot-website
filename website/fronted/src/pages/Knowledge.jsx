import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/config';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { useCategories } from '../contexts/CategoryContext';
import { 
  BookOpen, 
  Search, 
  ExternalLink,
  Calendar,
  Clock,
  User,
  Tag,
  Monitor,
  Shield,
  Settings,
  Zap,
  ArrowRight,
  Filter,
  Grid,
  List,
  Image as ImageIcon,
  Play,
  Download,
  Award,
  Terminal
} from 'lucide-react';

const Knowledge = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const { knowledgeCategories, refreshCategories } = useCategories();

  // Thumbnail mapping for articles
  const getThumbnailUrl = (article) => {
    // PRIORITY 1: Use base64 data if available
    if (article.thumbnail_data && 
        article.thumbnail_data !== 'null' && 
        article.thumbnail_data !== '' && 
        article.thumbnail_data !== null &&
        article.thumbnail_data.startsWith('data:')) {
      return article.thumbnail_data;
    }
    
    // PRIORITY 2: Use thumbnail_url if available
    if (article.thumbnail_url && 
        article.thumbnail_url !== 'null' && 
        article.thumbnail_url !== '' && 
        article.thumbnail_url !== null) {
      
      // Handle different URL formats
      if (article.thumbnail_url.startsWith('http')) {
        return article.thumbnail_url;
      } else if (article.thumbnail_url.startsWith('/article-thumbnails/')) {
        return `${API_BASE_URL}${article.thumbnail_url}`;
      } else if (article.thumbnail_url.startsWith('upload-')) {
        return `${API_BASE_URL}/article-thumbnails/${article.thumbnail_url}`;
      } else {
        return `${API_BASE_URL}/article-thumbnails/${article.thumbnail_url}`;
      }
    }
    
    // Fallback mapping based on article title/slug (only when no database thumbnail)
    const title = article.title.toLowerCase();
    const slug = article.slug || '';
    
    if (title.includes('cyber') || title.includes('security')) return `${API_BASE_URL}/article-thumbnails/53-cyber-security.webp`;
    if (title.includes('malware')) return `${API_BASE_URL}/article-thumbnails/malware.webp`;
    if (title.includes('os') || title.includes('install')) return `${API_BASE_URL}/article-thumbnails/os-installations.webp`;
    if (title.includes('retrieval') || title.includes('location')) return `${API_BASE_URL}/article-thumbnails/515-retrieval-and-location-of-web-pages.webp`;
    if (title.includes('internet') || title.includes('world wide web')) return `${API_BASE_URL}/article-thumbnails/51-514-the-internet-and-world-wide-web.webp`;
    if (title.includes('currency')) return `${API_BASE_URL}/article-thumbnails/52-currency.webp`;
    if (title.includes('blockchain')) return `${API_BASE_URL}/article-thumbnails/522-blockchain.webp`;
    if (title.includes('display') || title.includes('screen')) return `${API_BASE_URL}/article-thumbnails/display-screens.webp`;
    if (title.includes('symmetric') || title.includes('asymmetric') || title.includes('encryption')) return `${API_BASE_URL}/article-thumbnails/23-symmetric-and-asymmetric-encryption.webp`;
    if (title.includes('optical') || title.includes('mouse')) return `${API_BASE_URL}/article-thumbnails/328-optical-mouse.webp`;
    
    // Default fallback
    return '/logo.png';
  };

  // Format date function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };




  // Featured articles/tutorials
  const featuredContent = [
    {
      id: 1,
      title: 'Complete Guide to Computer Hardware Diagnostics',
      description: 'Learn professional techniques for diagnosing hardware issues step-by-step.',
      category: 'hardware',
      readTime: '15 min read',
      difficulty: 'Intermediate',
      featured: true
    },
    {
      id: 2,
      title: 'Cybersecurity Best Practices for Small Businesses',
      description: 'Essential security measures every business should implement.',
      category: 'security',
      readTime: '12 min read',
      difficulty: 'Beginner',
      featured: true
    },
    {
      id: 3,
      title: 'Malware Removal: Professional Techniques',
      description: 'Advanced methods for detecting and removing stubborn malware.',
      category: 'security',
      readTime: '20 min read',
      difficulty: 'Advanced',
      featured: true
    }
  ];

  useEffect(() => {
    fetchArticles();
    refreshCategories(); // Refresh categories to get latest from database
  }, []);

  // Handle URL parameters for category filtering and article selection
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const articleParam = searchParams.get('article');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (articleParam) {
      // Handle article parameter - scroll to specific article
      setTimeout(() => {
        const decodedArticleTitle = decodeURIComponent(articleParam);
        const articleElement = document.querySelector(`[data-article-title="${decodedArticleTitle}"]`);
        if (articleElement) {
          articleElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add highlight effect
          articleElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
          setTimeout(() => {
            articleElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // Fetch from our database API
      const response = await fetch(API_ENDPOINTS.ARTICLES);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles from database');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.articles) {
        setArticles(data.data.articles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Unable to load articles from database.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
  }, [articles, filteredArticles]);



  return (
    <div className="min-h-screen bg-background">
      {/* Professional Hero Section */}
      <section className="relative bg-hero-bg text-hero-text py-20">
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">

            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block text-white">Knowledge Center</span>
            </h1>
            
            <p className="text-xl text-hero-text/80 max-w-3xl mb-8">
              Tech Articles, tutorials, and insights for the tech-savvy. 
              Learn from real-world experience and industry best practices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="#articles">
                <Button size="lg" className="bg-primary text-primary-foreground font-semibold px-8 py-4 text-lg group border-0">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Articles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a 
                href="https://medium.com/@mrrobot.computerservice" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="border-2 border-primary text-hero-text font-semibold px-8 py-4 text-lg">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Visit Medium Blog
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-white/20"></div>

      {/* Search and Filter Section */}
      <section className="py-12 bg-background" id="articles">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Search and Controls */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Search Articles</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                    <Input
                      placeholder="Search knowledge base..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-muted focus:border-primary"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === ''
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      All Categories
                    </button>
                    {knowledgeCategories.map((category) => (
                      <button
                        key={category.id || category}
                        onClick={() => setSelectedCategory(category.name || category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === (category.name || category)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {category.name || category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Mode */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">View Mode</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'grid' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted-light text-foreground'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'list' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted-light text-foreground'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Content */}
            <div className="lg:w-3/4">
              {error && (
                <div className="mb-6 p-4 bg-orange-100 border border-orange-300 rounded-lg">
                  <p className="text-orange-700">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        All Articles
                      </h2>
                      <p className="text-foreground/70">{filteredArticles.length} articles found</p>
                    </div>
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-20">
                      <BookOpen className="h-16 w-16 text-foreground/40 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
                      <p className="text-foreground/70">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${
                      viewMode === 'grid' 

                       ? 'md:grid-cols-2 xl:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}>
                      {loading ? (
                        <div className="col-span-full text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-foreground/70">Loading articles...</p>
                        </div>
                      ) : error ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-red-600 mb-4">{error}</p>
                          <Button onClick={fetchArticles} className="bg-primary hover:bg-primary">
                            Retry
                          </Button>
                        </div>
                      ) : filteredArticles.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-foreground/70 mb-4">No articles found.</p>
                          <p className="text-sm text-foreground/50">Articles: {articles.length}, Filtered: {filteredArticles.length}</p>
                        </div>
                      ) : (
                        filteredArticles.map((article) => (
                        <Card 
                          key={article.id} 
                          data-article-title={article.title}
                          className={`border border-tin/20 bg-card cursor-pointer hover:shadow-lg transition-shadow ${
                            viewMode === 'list' ? 'flex' : ''
                          }`}
                          onClick={() => navigate(`/article/${article.slug}`)}
                        >
                          {viewMode === 'grid' ? (
                            <>
                              <div className="relative h-48 bg-muted overflow-hidden">
                                <img 
                                  src={getThumbnailUrl(article)} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    // Only fallback to logo if it's not already the logo
                                    if (!e.target.src.includes('logo.png')) {
                                      e.target.src = '/logo.png';
                                    }
                                  }}
                                  onLoad={() => {}}
                                />
                              </div>
                              <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold text-foreground line-clamp-2 mb-3">
                                  {article.title}
                                </CardTitle>
                                <CardDescription className="text-foreground/70 line-clamp-3 text-sm leading-relaxed">
                                  {article.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-sm text-foreground/60 mb-6">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(article.published_at || article.created_at)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>MR-ROBOT</span>
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  <Button 
                                    className="bg-primary hover:bg-secondary text-primary-foreground hover:text-secondary-foreground font-semibold py-3 px-8 text-base transition-colors"
                                    onClick={() => navigate(`/article/${article.slug}`)}
                                  >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Read Article
                                  </Button>
                                </div>
                              </CardContent>
                            </>
                          ) : (
                            <>
                              <div className="w-48 h-32 bg-muted flex-shrink-0 overflow-hidden">
                                <img 
                                  src={getThumbnailUrl(article)} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    // Only fallback to logo if it's not already the logo
                                    if (!e.target.src.includes('logo.png')) {
                                      e.target.src = '/logo.png';
                                    }
                                  }}
                                  onLoad={() => {}}
                                />
                              </div>
                              <div className="flex-1 p-6">
                                <h3 className="text-xl font-bold text-foreground mb-3">
                                  {article.title}
                                </h3>
                                <p className="text-foreground/70 mb-6 line-clamp-2 text-sm leading-relaxed">
                                  {article.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex items-center space-x-4 text-sm text-foreground/60">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(article.published_at || article.created_at)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <User className="h-4 w-4" />
                                      <span>MR-ROBOT</span>
                                    </div>
                                  </div>
                                  <Button 
                                    className="bg-primary hover:bg-secondary text-primary-foreground hover:text-secondary-foreground font-semibold px-6 py-2 transition-colors"
                                    onClick={() => navigate(`/article/${article.slug}`)}
                                  >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Read Article
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </Card>
                      ))
                    )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider - Tan line before footer */}
      <div className="h-px bg-tan/30"></div>

    </div>
  );
};

export default Knowledge;
