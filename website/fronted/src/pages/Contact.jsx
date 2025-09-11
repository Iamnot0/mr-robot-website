import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { API_ENDPOINTS } from '../utils/config';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../components/AuthContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  User,
  MessageSquare,
  Calendar
} from 'lucide-react';

const Contact = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // SEO and SEM Optimization
  useEffect(() => {
    // Update page title for better SEO
    document.title = "Contact MR-ROBOT Computer Repair | Professional Tech Support Myanmar";
    
    // Update meta description for search engines
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        "Contact MR-ROBOT for professional computer repair services in Myanmar. Get immediate tech support, book appointments, and expert assistance for all your computer issues."
      );
    }
  }, []);

  // Handle pre-filled booking data from service cards
  useEffect(() => {
    if (location.state?.prefillBooking && location.state?.selectedService) {
      const service = location.state.selectedService;
      setActiveTab('booking');
      setBookingForm(prev => ({
        ...prev,
        service_id: service.id,
        device_type: 'Desktop', // Default value
        issue_description: `I would like to book: ${service.name}`,
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || ''
      }));
    }
  }, [location.state, user]);
  const [activeTab, setActiveTab] = useState('contact');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    urgency: 'normal'
  });
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_id: '',
    device_type: '',
    issue_description: '',
    urgency: 'normal',
    preferred_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Helper functions for contact actions
  const handleContactAction = (info) => {
    switch (info.action) {
      case 'map':
        // Open Google Maps with coordinates
        const mapUrl = `https://www.google.com/maps?q=${info.coordinates}`;
        window.open(mapUrl, '_blank');
        break;
      case 'phone':
        // Initiate phone call
        window.open(`tel:${info.phoneNumber}`, '_self');
        break;
      case 'email':
        // Open email client
        window.open(`mailto:${info.emailAddress}`, '_self');
        break;
      default:
        break;
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Location",
      content: "16°47'31.1\"N 96°07'36.2\"E",
      color: "from-gray-700 to-gray-900",
      action: "map",
      coordinates: "16.791972,96.126722"
    },
    {
      icon: Phone,
      title: "Call Us Now",
      content: "+95 9 790 525 598",
      color: "from-gray-700 to-gray-900",
      action: "phone",
      phoneNumber: "+959790525598"
    },
    {
      icon: Mail,
      title: "Email Support",
      content: "mr.robotcomputerservice@gmail.com",
      color: "from-gray-700 to-gray-900",
      action: "email",
      emailAddress: "mr.robotcomputerservice@gmail.com"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon-Sat: 9AM-6PM",
      color: "from-gray-700 to-gray-900",
      action: "none"
    }
  ];

  const services = [
    { id: 1, name: "OS Installation & Setup", category: "Software", price: 75 },
    { id: 3, name: "Malware Removal & Security", category: "Security", price: 100 },
    { id: 4, name: "Cybersecurity Assessment", category: "Security", price: 200 },
    { id: 5, name: "Hardware Diagnostics", category: "Hardware", price: 50 },
    { id: 6, name: "Data Recovery", category: "Software", price: 125 }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-700', description: '3-5 business days' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700', description: '1-2 business days' },
    { value: 'high', label: 'Urgent', color: 'bg-orange-100 text-orange-700', description: 'Same day service' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-700', description: 'Immediate response' }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CONTACT_SUBMIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Message Sent Successfully!",
          description: data.message,
        });
        setContactForm({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: '',
          urgency: 'normal'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: error.message || "Please try again or contact us directly via phone.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingForm,
          user_id: user?.id || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Booking Created Successfully!",
          description: data.message,
        });
        setBookingForm({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          service_id: '',
          device_type: '',
          issue_description: '',
          urgency: 'normal',
          preferred_date: '',
          notes: ''
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleBookingChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="min-h-screen bg-white" role="main" aria-label="Contact MR-ROBOT Computer Repair">
      {/* Professional Hero Section */}
      <section className="relative bg-gradient-to-br from-mr-charcoal via-mr-charcoal-dark to-mr-black text-mr-white py-20" aria-labelledby="contact-hero-title">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 id="contact-hero-title" className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block">Contact</span>
              <span className="block text-mr-cerulean">MR-ROBOT</span>
            </h1>
            
            <p className="text-xl text-mr-blue-light max-w-3xl mb-8">
              Get professional computer repair support. Contact us for immediate assistance, 
              book a service appointment, or request emergency support.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-blue-50" aria-labelledby="contact-info-title">
        <div className="container mx-auto px-6">
          <h2 id="contact-info-title" className="sr-only">Contact Information</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card 
                key={index} 
                className={`group border-2 text-center bg-white transition-all duration-300 ${
                  info.action !== 'none' 
                    ? 'cursor-pointer' 
                    : ''
                }`}
                onClick={() => info.action !== 'none' && handleContactAction(info)}
                role={info.action !== 'none' ? 'button' : undefined}
                tabIndex={info.action !== 'none' ? 0 : undefined}
                onKeyDown={(e) => {
                  if (info.action !== 'none' && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleContactAction(info);
                  }
                }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <info.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-800 mb-2 break-words">
                    {info.content}
                  </p>
                  {info.action !== 'none' && (
                    <p className="text-sm text-mr-cerulean font-medium">
                      Click to {info.action === 'map' ? 'view on map' : info.action === 'phone' ? 'call now' : 'send email'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Contact & Booking System */}
      <section className="py-20 bg-white" aria-labelledby="contact-forms-title">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 id="contact-forms-title" className="sr-only">Contact and Booking Forms</h2>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12" role="tablist" aria-label="Contact and booking options">
              <div className="bg-blue-50 rounded-xl p-2 inline-flex">
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-8 py-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === 'contact'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'contact'}
                  aria-controls="contact-form-panel"
                  id="contact-tab"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>General Contact</span>
                </button>
                <button
                  onClick={() => setActiveTab('booking')}
                  className={`px-8 py-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === 'booking'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700'
                  }`}
                  role="tab"
                  aria-selected={activeTab === 'booking'}
                  aria-controls="booking-form-panel"
                  id="booking-tab"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Service</span>
                </button>
              </div>
            </div>

            {/* Contact/Booking Form */}
            <div>
              {activeTab === 'contact' ? (
                <Card className="border-2 shadow-xl" role="tabpanel" id="contact-form-panel" aria-labelledby="contact-tab">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                      <span className="text-gray-800">Send Us a Message</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      We typically respond within 2-4 hours during business hours
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Full Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="contact-name"
                              name="name"
                              type="text"
                              placeholder="Your full name"
                              value={contactForm.name}
                              onChange={handleContactChange}
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="contact-email"
                              name="email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={contactForm.email}
                              onChange={handleContactChange}
                              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                       <Input
                             id="contact-phone"
                             name="phone"
                             type="tel"
                             placeholder="95912345678 (no + or spaces)"
                             value={contactForm.phone}
                             onChange={handleContactChange}
                             className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                           />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-service">Service Interest</Label>
                          <select
                            id="contact-service"
                            name="service"
                            value={contactForm.service}
                            onChange={handleContactChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a service...</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Message *</Label>
                        <Textarea
                          id="contact-message"
                          name="message"
                          placeholder="Please describe your computer issue or inquiry in detail..."
                          value={contactForm.message}
                          onChange={handleContactChange}
                          rows={5}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-gray-800 text-white font-semibold py-4 text-lg group hover:from-blue-700 hover:to-gray-900 transition-all duration-200"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 shadow-xl" role="tabpanel" id="booking-form-panel" aria-labelledby="booking-tab">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      <span className="text-gray-800">Book a Service</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Schedule a professional repair appointment
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="booking-name">Full Name *</Label>
                          <Input
                            id="booking-name"
                            name="customer_name"
                            value={bookingForm.customer_name}
                            onChange={handleBookingChange}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="booking-email">Email *</Label>
                          <Input
                            id="booking-email"
                            name="customer_email"
                            type="email"
                            value={bookingForm.customer_email}
                            onChange={handleBookingChange}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                                              <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="booking-phone">Phone Number</Label>
                            <Input
                              id="booking-phone"
                              name="customer_phone"
                              type="tel"
                              placeholder="95912345678 (no + or spaces)"
                              value={bookingForm.customer_phone}
                              onChange={handleBookingChange}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="booking-service">Service *</Label>
                            <select
                              id="booking-service"
                              name="service_id"
                              value={bookingForm.service_id}
                              onChange={handleBookingChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select a service...</option>
                              {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.name} - {service.price} MMK
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="booking-device">Device Type *</Label>
                          <Input
                            id="booking-device"
                            name="device_type"
                            placeholder="e.g., Laptop, Desktop, Tablet, Phone"
                            value={bookingForm.device_type}
                            onChange={handleBookingChange}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-message">Issue Description *</Label>
                          <Textarea
                            id="booking-issue"
                            name="issue_description"
                            placeholder="Please describe the problem in detail..."
                            value={bookingForm.issue_description}
                            onChange={handleBookingChange}
                            rows={4}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="booking-date">Preferred Date</Label>
                            <Input
                              id="booking-date"
                              name="preferred_date"
                              type="datetime-local"
                              value={bookingForm.preferred_date}
                              onChange={handleBookingChange}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Urgency</Label>
                            <select
                              name="urgency"
                              value={bookingForm.urgency}
                              onChange={handleBookingChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {urgencyLevels.map((level) => (
                                <option key={level.value} value={level.value}>
                                  {level.label} - {level.description}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                                              <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-600 to-gray-800 text-white font-semibold py-4 text-lg group hover:from-blue-700 hover:to-gray-900 transition-all duration-200"
                          disabled={loading}
                        >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creating Booking...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-5 w-5" />
                            Book Service
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;