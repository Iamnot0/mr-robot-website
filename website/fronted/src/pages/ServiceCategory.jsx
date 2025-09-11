import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/config';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../components/AuthContext';

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
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book a service",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // Navigate to contact page with pre-filled service
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
      <div className="min-h-screen bg-mr-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-mr-charcoal/70 text-lg">Loading services...</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-mr-white">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-mr-charcoal mb-4">Category Not Found</h1>
            <p className="text-mr-charcoal/70 mb-8">The requested service category could not be found.</p>
            <Link to="/services">
              <Button className="bg-mr-cerulean text-mr-white hover:bg-mr-cerulean">
                ← Back to Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mr-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-mr-charcoal via-mr-charcoal-dark to-mr-black text-mr-white py-20">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/services">
                <Button variant="outline" size="sm" className="border-mr-cerulean text-mr-cerulean hover:bg-mr-cerulean hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block">{categoryName}</span>
              <span className="block text-mr-cerulean">Services</span>
            </h1>
            
            <p className="text-xl text-mr-blue-light max-w-3xl mb-8">
              Professional {categoryName.toLowerCase()} designed for your specific needs.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-mr-blue-light">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-4 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-mr-charcoal">
                Available Services
              </h2>
            </div>
            <p className="text-xl text-mr-charcoal/70 max-w-3xl mx-auto">
              Choose from our professional {categoryName.toLowerCase()} offerings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, serviceIndex) => (
              <Card key={serviceIndex} className="border-2 border-mr-cerulean bg-mr-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="space-y-3">
                    <CardTitle className="text-xl font-bold text-mr-charcoal leading-tight">
                      {service.name}
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-mr-cerulean">
                        {service.price} MMK
                      </div>
                      <div className="text-lg text-mr-charcoal/80">
                        ${Math.round(service.price / 4400).toFixed(2)} USD
                      </div>
                      <div className="text-sm text-mr-charcoal/60">{service.duration}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-mr-charcoal/70 mb-6 text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleBookService(service)}
                      className="bg-mr-cerulean text-mr-white hover:bg-mr-cerulean px-8 py-2"
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
