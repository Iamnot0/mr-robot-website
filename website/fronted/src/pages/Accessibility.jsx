import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Eye, MousePointer, Volume2, Keyboard, Monitor, Heart } from 'lucide-react';

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-hero-bg text-hero-text py-20">
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block text-hero-text">Accessibility</span>
              <span className="block text-hero-text/90">Statement</span>
            </h1>
            <p className="text-xl text-hero-text/90 max-w-3xl mb-8">
              We are committed to making our website and services accessible to everyone.
            </p>
            <p className="text-sm text-hero-text/80">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-white/20"></div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Our Commitment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <span>Our Commitment to Accessibility</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                MR-ROBOT Computer Repair is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to make our website and services more accessible.
              </p>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-6 w-6 text-primary" />
                <span>Website Accessibility Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Eye className="h-5 w-5 text-primary mr-2" />
                    Visual Accessibility
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>High contrast color schemes (Oxford Blue & Tan)</li>
                    <li>Dark and light theme options</li>
                    <li>Scalable text and interface elements</li>
                    <li>Clear typography and readable fonts</li>
                    <li>Alternative text for images</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <MousePointer className="h-5 w-5 text-primary mr-2" />
                    Navigation & Interaction
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Keyboard navigation support</li>
                    <li>Focus indicators for interactive elements</li>
                    <li>Logical tab order throughout the site</li>
                    <li>Skip links for main content</li>
                    <li>Consistent navigation patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assistive Technologies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="h-6 w-6 text-primary" />
                <span>Assistive Technology Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our website is designed to work with various assistive technologies:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Screen Readers</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Semantic HTML structure</li>
                    <li>ARIA labels and descriptions</li>
                    <li>Proper heading hierarchy</li>
                    <li>Descriptive link text</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Other Technologies</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Voice recognition software</li>
                    <li>Switch navigation devices</li>
                    <li>Screen magnification tools</li>
                    <li>Text-to-speech applications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Keyboard className="h-6 w-6 text-primary" />
                <span>Keyboard Navigation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You can navigate our website using only your keyboard:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Navigation Keys</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Tab:</strong> Move to next interactive element</li>
                    <li><strong>Shift + Tab:</strong> Move to previous element</li>
                    <li><strong>Enter/Space:</strong> Activate buttons and links</li>
                    <li><strong>Arrow Keys:</strong> Navigate menus and lists</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Form Navigation</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Tab:</strong> Move between form fields</li>
                    <li><strong>Enter:</strong> Submit forms</li>
                    <li><strong>Escape:</strong> Close modals and menus</li>
                    <li><strong>Alt + Access Key:</strong> Quick navigation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Service Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We are committed to making our physical services accessible to all customers:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Service Options</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Home/office service visits available</li>
                    <li>Remote support and assistance</li>
                    <li>Flexible scheduling options</li>
                    <li>Multiple communication methods</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Communication</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Clear, simple language in all communications</li>
                    <li>Written summaries of all work performed</li>
                    <li>Multiple contact methods (phone, email, chat)</li>
                    <li>Patient, detailed explanations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standards Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We strive to meet or exceed the following accessibility standards:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>WCAG 2.1 AA:</strong> Web Content Accessibility Guidelines</li>
                <li><strong>Section 508:</strong> US Federal accessibility standards</li>
                <li><strong>ADA Compliance:</strong> Americans with Disabilities Act</li>
                <li><strong>EN 301 549:</strong> European accessibility standard</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feedback & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We welcome feedback on the accessibility of our website and services. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> mr.robotcomputerservice@gmail.com</p>
                <p><strong>Phone:</strong> +95 9 790 525 598</p>
                <p><strong>Address:</strong> 16°47'31.1"N 96°07'36.2"E</p>
              </div>
              <p className="text-muted-foreground">
                We will respond to accessibility feedback within 2 business days and work to address any issues promptly.
              </p>
            </CardContent>
          </Card>

          {/* Ongoing Improvements */}
          <Card>
            <CardHeader>
              <CardTitle>Ongoing Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Accessibility is an ongoing effort. We regularly review and update our website and services to improve accessibility. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Regular accessibility audits and testing</li>
                <li>User feedback integration</li>
                <li>Staff training on accessibility best practices</li>
                <li>Technology updates and improvements</li>
                <li>Compliance with evolving accessibility standards</li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Accessibility;
