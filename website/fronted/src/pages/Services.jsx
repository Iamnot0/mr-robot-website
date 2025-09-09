import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/config';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RefreshCw, Package, Settings, Shield, Zap, Globe } from 'lucide-react';
import { useCategories } from '../contexts/CategoryContext';


const Services = () => {
  const { serviceCategories, loading: categoriesLoading, refreshCategories } = useCategories();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate safe ID for category
  const generateSafeId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  useEffect(() => {
    // Fetch services from API when component mounts
    fetchServices();
  }, []);

  // Force refresh on component mount to clear any cached data
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Refresh services when categories change
  useEffect(() => {
    if (serviceCategories.length > 0) {
      fetchServices();
    }
  }, [serviceCategories]);



  // Handle hash navigation for smooth scrolling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        // Try to find element by ID first
        const element = document.getElementById(hash.substring(1));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
            // Add offset for fixed navbar
            window.scrollBy(0, -80);
          }, 500); // Wait for content to load
        }
      }
    };

    // Handle initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`${API_ENDPOINTS.SERVICES}?t=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };



  // Get category icon - now dynamic from database
  const getCategoryIcon = (categoryName) => {
    // Find the category in serviceCategories data to get the icon
    const category = serviceCategories.find(cat => cat.name === categoryName);
    if (category && category.icon) {
      // Map icon names to components
      const iconMap = {
        'Settings': Settings,
        'Package': Package,
        'Shield': Shield,
        'Zap': Zap,
        'Globe': Globe,
        'Monitor': Settings,
        'Terminal': Settings,
        'Database': Settings,
        'Server': Settings,
        'Cpu': Settings,
        'HardDrive': Settings,
        'Wifi': Zap
      };
      return iconMap[category.icon] || Package;
    }
    
    // Fallback to hardcoded mapping for backward compatibility
    const fallbackMap = {
      'Software Solutions': Settings,
      'Hardware Solutions': Package,
      'Data & Security Solutions': Shield,
      'Security Solutions': Shield,
      'Security': Shield,
      'Network Solutions': Zap,
      'Web Services': Globe
    };
    return fallbackMap[categoryName] || Package;
  };

  return (
    <div className="min-h-screen bg-mr-white">
      {/* Professional Hero Section */}
      <section className="relative bg-gradient-to-br from-mr-charcoal via-mr-charcoal-dark to-mr-black text-mr-white py-20">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block">Expert Computer</span>
              <span className="block text-mr-cerulean">Repair Services</span>
            </h1>
            
            <p className="text-xl text-mr-blue-light max-w-3xl mb-8">
              Professional repair packages and individual services designed for every need - 
              from basic maintenance to enterprise cybersecurity solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-mr-blue-light">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-mr-charcoal">
                Service Categories
            </h2>
              <Button 
                onClick={fetchServices}
                disabled={loading}
                variant="outline" 
                size="sm"
                className="border-mr-cerulean text-mr-cerulean hover:bg-mr-cerulean hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <p className="text-xl text-mr-charcoal/70 max-w-3xl mx-auto">
              Choose a service category to view available services.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-mr-charcoal/70 text-lg">Loading services...</p>
            </div>
          ) : serviceCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceCategories.map((category, categoryIndex) => {
                const CategoryIcon = getCategoryIcon(category.name);
                return (
                  <Card 
                    key={categoryIndex} 
                    className="border-2 border-mr-cerulean bg-mr-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => {
                      const safeId = generateSafeId(category.name);
                      // Navigate to the category page with proper URL
                      window.location.href = `/services/${safeId}`;
                    }}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-mr-cerulean rounded-full flex items-center justify-center mx-auto mb-4">
                        <CategoryIcon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-mr-charcoal">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-mr-charcoal/70">
                        {category.description || 'Professional services available'}
                      </CardDescription>
                </CardHeader>
                    <CardContent className="text-center">
                      <Button className="bg-mr-cerulean text-mr-white hover:bg-mr-cerulean px-8 py-2">
                        View Services
                      </Button>
                </CardContent>
              </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-mr-charcoal/70 text-lg">No service categories available at the moment.</p>
          </div>
          )}
        </div>
      </section>




    </div>
  );
};

export default Services;