import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Award, Shield, Wrench, Clock, Star, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <Wrench className="h-16 w-16 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            About Our Website
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Computer repair and cybersecurity services with a commitment to excellence.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Mission Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-primary" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg leading-relaxed">
                At MR-ROBOT, we believe that technology should work for you, not against you. Our mission is to provide 
                reliable, professional computer repair and cybersecurity services that keep your devices running smoothly 
                and your data secure. We combine technical expertise with genuine care for our customers' needs.
              </p>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-primary" />
                <span>Professional Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Our team holds industry-recognized certifications that demonstrate our commitment to professional excellence:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">A+ Certification</h3>
                      <p className="text-muted-foreground text-sm">
                        Comprehensive hardware and software troubleshooting expertise
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Network+ Certification</h3>
                      <p className="text-muted-foreground text-sm">
                        Advanced networking and connectivity solutions
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Security+ Certification</h3>
                      <p className="text-muted-foreground text-sm">
                        Cybersecurity and data protection expertise
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Linux Professional</h3>
                      <p className="text-muted-foreground text-sm">
                        Advanced Linux system administration and support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Approach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>Our Service Approach</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We take a comprehensive approach to computer repair and cybersecurity:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Thorough Diagnostics:</strong> We identify the root cause, not just the symptoms</li>
                <li><strong>Transparent Communication:</strong> Clear explanations of issues and solutions</li>
                <li><strong>Quality Parts:</strong> We use only high-quality, compatible components</li>
                <li><strong>Data Protection:</strong> Your data security is our top priority</li>
                <li><strong>Warranty Coverage:</strong> All repairs come with comprehensive warranties</li>
                <li><strong>Ongoing Support:</strong> We're here for you even after the repair is complete</li>
              </ul>
            </CardContent>
          </Card>

          {/* Why Choose Us */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-primary" />
                <span>Why Choose MR-ROBOT?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Professional Excellence</h3>
                    <p className="text-muted-foreground">
                      Certified technicians with years of experience in computer repair and cybersecurity.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Fast Turnaround</h3>
                    <p className="text-muted-foreground">
                      Most repairs completed within 24-48 hours, with emergency services available.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Fair Pricing</h3>
                    <p className="text-muted-foreground">
                      Transparent, competitive pricing with no hidden fees or surprise charges.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Customer Satisfaction</h3>
                    <p className="text-muted-foreground">
                      We stand behind our work with comprehensive warranties and ongoing support.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ready to experience professional computer repair services? Contact us today:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Phone:</strong> +95 9 790 525 598</p>
                  <p><strong>Email:</strong> mr.robotcomputerservice@gmail.com</p>
                  <p><strong>Location:</strong> 16°47'31.1"N 96°07'36.2"E</p>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Business Hours:</strong></p>
                  <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                  <p>Sunday: Closed</p>
                  <p><strong>Emergency Services:</strong> Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default About;
