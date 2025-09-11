import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/config';
import { useCategories } from '../contexts/CategoryContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
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
  const { knowledgeCategories } = useCategories();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);

  // Thumbnail mapping for articles
  const getThumbnailUrl = (article) => {
    // If article has a valid thumbnail_url from database, use it first
    if (article.thumbnail_url && 
        article.thumbnail_url !== 'null' && 
        article.thumbnail_url !== '' && 
        article.thumbnail_url !== null) {
      
      // Handle different URL formats
      if (article.thumbnail_url.startsWith('http')) {
        return article.thumbnail_url;
      } else if (article.thumbnail_url.startsWith('/article-thumbnails/')) {
        // For uploaded files, use backend URL
        return `${API_BASE_URL}${article.thumbnail_url}`;
      } else {
        // For filename-only, construct full path
        return `${API_BASE_URL}/article-thumbnails/${article.thumbnail_url}`;
      }
    }
    
    // Fallback mapping based on article title/slug (only when no database thumbnail)
    const title = article.title.toLowerCase();
    const slug = article.slug || '';
    
    if (title.includes('cyber') || title.includes('security')) return '/article-thumbnails/53-cyber-security.webp';
    if (title.includes('malware')) return '/article-thumbnails/malware.webp';
    if (title.includes('os') || title.includes('install')) return '/article-thumbnails/os-installations.webp';
    if (title.includes('retrieval') || title.includes('location')) return '/article-thumbnails/515-retrieval-and-location-of-web-pages.webp';
    if (title.includes('internet') || title.includes('world wide web')) return '/article-thumbnails/51-514-the-internet-and-world-wide-web.webp';
    if (title.includes('currency')) return '/article-thumbnails/52-currency.webp';
    if (title.includes('blockchain')) return '/article-thumbnails/522-blockchain.webp';
    if (title.includes('display') || title.includes('screen')) return '/article-thumbnails/display-screens.webp';
    if (title.includes('symmetric') || title.includes('asymmetric') || title.includes('encryption')) return '/article-thumbnails/23-symmetric-and-asymmetric-encryption.webp';
    if (title.includes('optical') || title.includes('mouse')) return '/article-thumbnails/328-optical-mouse.webp';
    
    // Default fallback
    return '/logo2.png';
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

  // Categories for organizing knowledge content - now dynamic
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Articles', icon: BookOpen, count: 0 }
  ]);



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
  }, []);

  // Handle URL parameters for category filtering and article selection
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const articleParam = searchParams.get('article');
    
    if (categoryParam) {
      // Map URL parameters to category IDs
      const categoryMap = {
        'computer-science': 'computer-science',
        'linux': 'linux',
        'a-plus': 'a-plus',
        'network-plus': 'network-plus',
        'security-plus': 'security-plus',
        'security': 'security'
      };
      
      if (categoryMap[categoryParam]) {
        setSelectedCategory(categoryMap[categoryParam]);
        // Smooth scroll to content after category change
        setTimeout(() => {
          const contentElement = document.querySelector('.lg\\:w-3\\/4');
          if (contentElement) {
            contentElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
      }
    } else {
      // If no category parameter, show all articles
      setSelectedCategory('all');
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
          articleElement.classList.add('ring-2', 'ring-mr-cerulean', 'ring-opacity-50');
          setTimeout(() => {
            articleElement.classList.remove('ring-2', 'ring-mr-cerulean', 'ring-opacity-50');
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
        
        // Use knowledge categories from context
        const dynamicCategories = knowledgeCategories.map(category => ({
          id: category.name, // Use category name as ID for direct matching
          name: category.name,
          icon: BookOpen, // Default icon for knowledge categories
          count: data.data.articles.filter(a => a.category === category.name).length
        }));
        
        console.log('Dynamic categories:', dynamicCategories);
        console.log('Articles sample:', data.data.articles.slice(0, 3).map(a => ({ title: a.title, category: a.category })));
        
        setCategories([
          { id: 'all', name: 'All Articles', icon: BookOpen, count: data.data.articles.length },
          ...dynamicCategories
        ]);
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
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle both old format (categories array) and new format (category string)
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (article.categories && Array.isArray(article.categories)) {
      // Old format with categories array
      matchesCategory = article.categories.some(cat => cat.toLowerCase().includes(selectedCategory));
    } else if (article.category) {
      // New format with single category string - match by category name directly
      matchesCategory = article.category === selectedCategory;
      if (selectedCategory !== 'all') {
        console.log(`Filtering: selectedCategory="${selectedCategory}", article.category="${article.category}", matches=${matchesCategory}`);
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
  }, [articles, filteredArticles]);



  return (
    <div className="min-h-screen bg-mr-white">
      {/* Professional Hero Section */}
      <section className="relative bg-gradient-to-br from-mr-charcoal via-mr-charcoal-dark to-mr-black text-mr-white py-20">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">

            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block">Professional</span>
              <span className="block text-mr-cerulean">Knowledge Center</span>
            </h1>
            
            <p className="text-xl text-mr-blue-light max-w-3xl mb-8">
              Expert articles, tutorials, and insights from our professional computer repair team. 
              Learn from real-world experience and industry best practices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="#articles">
                <Button size="lg" className="bg-mr-cerulean text-mr-white font-semibold px-8 py-4 text-lg group border-0">
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
                <Button size="lg" variant="outline" className="border-2 border-mr-cerulean text-mr-cerulean font-semibold px-8 py-4 text-lg">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Visit Medium Blog
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>



      {/* Search and Filter Section */}
      <section className="py-12 bg-mr-white" id="articles">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Search and Controls */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-mr-charcoal">Search Articles</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-mr-charcoal/40" />
                    <Input
                      placeholder="Search knowledge base..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-mr-blue focus:border-mr-cerulean"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-mr-charcoal">Categories</h3>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        console.log('Category clicked:', category.id, category.name);
                        setSelectedCategory(category.id);
                        // Update URL parameter
                        if (category.id === 'all') {
                          setSearchParams({});
                        } else {
                          setSearchParams({ category: category.id });
                        }
                      }}
                      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-mr-cerulean text-mr-white'
                          : 'text-mr-charcoal'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* View Mode */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-mr-charcoal">View Mode</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'grid' 
                          ? 'bg-mr-cerulean text-mr-white' 
                          : 'bg-mr-blue-light text-mr-charcoal'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'list' 
                          ? 'bg-mr-cerulean text-mr-white' 
                          : 'bg-mr-blue-light text-mr-charcoal'
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mr-cerulean"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-mr-charcoal">
                        {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
                      </h2>
                      <p className="text-mr-charcoal/70">{filteredArticles.length} articles found</p>
                    </div>
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-20">
                      <BookOpen className="h-16 w-16 text-mr-charcoal/40 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-mr-charcoal mb-2">No articles found</h3>
                      <p className="text-mr-charcoal/70">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${
                      viewMode === 'grid' 

                       ? 'md:grid-cols-2 xl:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}>
                      {loading ? (
                        <div className="col-span-full text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mr-cerulean mx-auto mb-4"></div>
                          <p className="text-mr-charcoal/70">Loading articles...</p>
                        </div>
                      ) : error ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-red-600 mb-4">{error}</p>
                          <Button onClick={fetchArticles} className="bg-mr-cerulean hover:bg-mr-cerulean">
                            Retry
                          </Button>
                        </div>
                      ) : filteredArticles.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-mr-charcoal/70 mb-4">No articles found.</p>
                          <p className="text-sm text-mr-charcoal/50">Articles: {articles.length}, Filtered: {filteredArticles.length}</p>
                        </div>
                      ) : (
                        filteredArticles.map((article) => (
                        <Card 
                          key={article.id} 
                          data-article-title={article.title}
                          className={`border-2 border-mr-cerulean bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                            viewMode === 'list' ? 'flex' : ''
                          }`}
                          onClick={() => navigate(`/article/${article.slug}`)}
                        >
                          {viewMode === 'grid' ? (
                            <>
                              <div className="relative h-48 bg-mr-blue-light overflow-hidden">
                                <img 
                                  src={getThumbnailUrl(article)} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/logo2.png';
                                  }}
                                />
                              </div>
                              <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold text-mr-charcoal line-clamp-2 mb-3">
                                  {article.title}
                                </CardTitle>
                                <CardDescription className="text-mr-charcoal/70 line-clamp-3 text-sm leading-relaxed">
                                  {article.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-sm text-mr-charcoal/60 mb-6">
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
                                    className="bg-gradient-to-r from-mr-cerulean to-mr-cerulean-dark text-mr-white font-semibold py-3 px-8 text-base"
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
                              <div className="w-48 h-32 bg-mr-blue-light flex-shrink-0 overflow-hidden">
                                <img 
                                  src={getThumbnailUrl(article)} 
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/logo2.png';
                                  }}
                                />
                              </div>
                              <div className="flex-1 p-6">
                                <h3 className="text-xl font-bold text-mr-charcoal mb-3">
                                  {article.title}
                                </h3>
                                <p className="text-mr-charcoal/70 mb-6 line-clamp-2 text-sm leading-relaxed">
                                  {article.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex items-center space-x-4 text-sm text-mr-charcoal/60">
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
                                    className="bg-gradient-to-r from-mr-cerulean to-mr-cerulean-dark text-mr-white font-semibold px-6 py-2"
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


    </div>
  );
};

export default Knowledge;
