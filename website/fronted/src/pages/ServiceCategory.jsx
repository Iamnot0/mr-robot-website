import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/config';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../components/AuthContext';
import { formatPrice } from '../utils/currency';

const ServiceCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  // Generate safe ID for category (same function as in Services.jsx)
  const generateSafeId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };



  useEffect(() => {
    fetchServices();
  }, [categoryId]);

  const handleBookService = (service) => {
    // Navigate to contact page with pre-filled service (no login required)
    navigate('/contact', { 
      state: { 
        selectedService: service,
        prefillBooking: true 
      } 
    });
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.SERVICES}?t=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        // Find the category that matches the categoryId
        const category = data.data.find(cat => generateSafeId(cat.category) === categoryId);
        if (category) {
          setServices(category.services);
          setCategoryName(category.category);
        } else {
          setServices([]);
          setCategoryName('Category Not Found');
        }
      }
    } catch (error) {
      setServices([]);
      setCategoryName('Error Loading Category');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/70 text-lg">Loading services...</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-foreground/70 mb-8">The requested service category could not be found.</p>
            <Link to="/services">
              <Button className="bg-primary text-primary-foreground hover:bg-primary">
                ← Back to Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-hero-bg text-hero-text py-20">
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/services">
                <Button variant="outline" size="sm" className="border-hero-text text-hero-text hover:bg-hero-text hover:text-hero-bg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block">{categoryName}</span>
              <span className="block text-hero-text">Services</span>
            </h1>
            
            <p className="text-xl text-muted-light max-w-3xl mb-8">
              Professional {categoryName.toLowerCase()} designed for your specific needs.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-muted-light">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Available Services
              </h2>
            </div>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Choose from our professional {categoryName.toLowerCase()} offerings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, serviceIndex) => (
              <Card key={serviceIndex} className="border-2 border-primary bg-background shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="space-y-3">
                    <CardTitle className="text-xl font-bold text-foreground leading-tight">
                      {service.name}
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {service.price} MMK
                      </div>
                      <div className="text-sm text-foreground/60">
                        ≈ ${formatPrice(service.price).usd} USD
                      </div>
                      <div className="text-sm text-foreground/60">{service.duration}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-foreground/70 mb-6 text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleBookService(service)}
                      className="bg-primary text-primary-foreground hover:bg-primary px-8 py-2"
                    >
                      Book Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceCategory;
