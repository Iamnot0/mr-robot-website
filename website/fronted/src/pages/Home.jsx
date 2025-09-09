import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Monitor, 
  Shield, 
  Settings, 
  Zap, 
  Star, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin,
  Mail,
  Award,
  Target,
  Wrench,
  Server
} from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    clients: 500,
    repairs: 1000,
    rating: 4.9,
    years: 5
  });


  const serviceCategories = [
    {
      id: 'software',
      title: 'Software Solutions',
      description: 'Operating systems, malware removal, and software optimization',
      icon: Settings,
      color: 'from-mr-cerulean to-mr-cerulean-dark',
      services: ['OS Installation', 'Software Setup', 'System Optimization', 'Driver Updates']
    },
    {
      id: 'hardware',
      title: 'Hardware Repair',
      description: 'Professional hardware diagnostics and component replacement',
      icon: Monitor,
      color: 'from-mr-charcoal to-mr-charcoal-dark',
      services: ['Screen Replacement', 'Component Repair', 'Motherboard Service', 'Power Issues']
    },
    {
      id: 'security',
      title: 'Cybersecurity',
      description: 'Advanced security solutions and threat protection',
      icon: Shield,
      color: 'from-mr-cerulean-light to-mr-cerulean',
      services: ['Malware Removal', 'Security Audit', 'Firewall Setup', 'Data Protection']
    },
    {
      id: 'networking',
      title: 'Network Solutions',
      description: 'Network setup, troubleshooting, and optimization',
      icon: Zap,
      color: 'from-mr-charcoal-light to-mr-charcoal',
      services: ['Network Setup', 'WiFi Configuration', 'VPN Setup', 'Network Security']
    }
  ];



  const testimonials = [
    {
      name: 'TechStart Solutions',
      role: 'IT Manager',
      content: 'Outstanding cybersecurity services. They secured our entire office network perfectly.',
      rating: 5,
      type: 'business'
    },
    {
      name: 'Sarah Digital Agency',
      role: 'Creative Director',
      content: 'Fast malware removal and data recovery. Saved our important client files.',
      rating: 5,
      type: 'business'
    },
    {
      name: 'Local Restaurant Chain',
      role: 'Operations Manager',
      content: '24/7 support when our POS system crashed. Back up and running in 2 hours.',
      rating: 5,
      type: 'business'
    }
  ];

  return (
    <div className="min-h-screen bg-mr-white">
      {/* Professional Hero Section - Bold & Clean */}
      <section className="relative bg-gradient-to-br from-mr-charcoal via-mr-charcoal-dark to-mr-black text-mr-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="block text-mr-white">MR-ROBOT</span>
                <span className="block text-mr-cerulean">Computer Repair</span>
                <span className="block text-lg md:text-xl font-normal text-mr-blue-light mt-4">
                  Professional. Reliable. Expert Solutions.
                </span>
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-mr-blue-light mb-8 max-w-3xl leading-relaxed">
              Expert computer repair, cybersecurity solutions, and technical support. 
              From hardware repairs to security audits - we solve every problem with precision and professionalism.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/services">
                <Button size="lg" className="bg-mr-cerulean text-mr-white font-semibold px-8 py-4 text-lg group border-0">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-mr-cerulean text-mr-cerulean font-semibold px-8 py-4 text-lg">
                  Get Free Quote
                </Button>
              </Link>
            </div>


          </div>
        </div>
      </section>



      {/* Service Categories - Professional Layout */}
      <section className="py-20 bg-mr-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-mr-charcoal mb-6">
              Professional Services
            </h2>
            <p className="text-xl text-mr-charcoal/70 max-w-3xl mx-auto">
              Comprehensive computer repair and cybersecurity solutions delivered with 
              professional expertise and industry-leading standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Services Card */}
            <Link to="/services">
              <Card className="border-2 border-mr-cerulean bg-mr-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-gradient-to-br from-mr-cerulean to-mr-cerulean-dark rounded-xl text-mr-white shadow-lg">
                      <Settings className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-mr-charcoal group-hover:text-mr-cerulean transition-colors">
                        Services
                      </CardTitle>
                      <CardDescription className="text-mr-charcoal/70">
                        Explore our comprehensive computer repair and cybersecurity services
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">Hardware Repair</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">Software Solutions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">Cybersecurity</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">Network Solutions</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-mr-cerulean font-semibold group-hover:text-mr-cerulean-dark transition-colors">
                    View Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Knowledge Card */}
            <Link to="/knowledge">
              <Card className="border-2 border-mr-cerulean bg-mr-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-gradient-to-br from-mr-charcoal to-mr-charcoal-dark rounded-xl text-mr-white shadow-lg">
                      <Shield className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-mr-charcoal group-hover:text-mr-cerulean transition-colors">
                        Knowledge Base
                      </CardTitle>
                      <CardDescription className="text-mr-charcoal/70">
                        Access expert articles and professional tips for computer solutions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">Computer Science</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">Linux</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">A+ Certification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-mr-cerulean flex-shrink-0" />
                      <span className="text-sm text-mr-charcoal/80 font-medium">Network+ & Security+</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-mr-cerulean font-semibold group-hover:text-mr-cerulean-dark transition-colors">
                    Browse Knowledge
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Testimonials */}
      <section className="py-20 bg-gradient-to-br from-mr-blue-light to-mr-blue">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-mr-charcoal mb-6">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-mr-charcoal/70 max-w-2xl mx-auto">
              Industry leaders and businesses trust MR-ROBOT for their critical technology needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-mr-white border-2 border-mr-cerulean">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <Badge variant="secondary" className="ml-auto text-xs text-white">
                      {testimonial.type}
                    </Badge>
                  </div>
                  <p className="text-mr-charcoal/80 mb-6 italic font-medium">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-mr-charcoal">{testimonial.name}</div>
                    <div className="text-sm text-mr-charcoal/70">{testimonial.role}</div>
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

export default Home;