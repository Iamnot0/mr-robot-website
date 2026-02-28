import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/config';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RefreshCw } from 'lucide-react';
import { formatPrice } from '../utils/currency';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
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

  const handleBookService = (service) => {
    navigate('/contact', { 
      state: { 
        selectedService: service,
        prefillBooking: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-hero-bg text-hero-text py-20">
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block text-white">Our</span>
              <span className="block text-hero-text">Services</span>
            </h1>
            <p className="text-xl text-hero-text/80 max-w-3xl mb-8">
              Professional repair and tech solutions — pick a service and book directly.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-white/20"></div>

      <section className="py-16 bg-muted-light">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center gap-4 mb-10">
            <Button 
              onClick={fetchServices}
              disabled={loading}
              variant="outline" 
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-foreground/70 text-lg">Loading services...</p>
            </div>
          ) : services.length > 0 ? (
            <div className="space-y-16">
              {services.map((category, catIndex) => (
                <div key={catIndex}>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {category.category}
                  </h2>
                  <div className="h-0.5 bg-tan mb-8 w-24"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.services.map((service, svcIndex) => (
                      <Card key={svcIndex} className="border border-border bg-card shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold text-foreground leading-tight">
                            {service.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <p className="text-foreground/60 dark:text-foreground/90 text-sm mb-4 flex-1">
                            {service.description}
                          </p>

                          {service.features && service.features.length > 0 && (
                            <ul className="text-sm text-foreground/60 dark:text-foreground/90 mb-4 space-y-1">
                              {service.features.slice(0, 3).map((f, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-tan font-bold mt-0.5">✓</span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="flex items-end justify-between mt-auto pt-4 border-t border-border">
                            <div>
                              <div className="text-xl font-bold text-primary">
                                {Number(service.price).toLocaleString()} MMK
                              </div>
                              <div className="text-xs text-foreground/50 dark:text-foreground/80">
                                ≈ ${formatPrice(service.price).usd} USD · {service.duration}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleBookService(service)}
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              Book
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground/70 text-lg">No services available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <div className="h-px bg-tan/30"></div>
    </div>
  );
};

export default Services;
