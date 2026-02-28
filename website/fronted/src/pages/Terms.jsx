import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Shield, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-hero-bg text-hero-text py-20">
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block text-white">Terms of</span>
              <span className="block text-hero-text">Service</span>
            </h1>
            <p className="text-xl text-hero-text/80 max-w-3xl mb-8">
              Please read these terms carefully before using our computer repair services.
            </p>
            <p className="text-sm text-hero-text/60">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-white/20"></div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using MR-ROBOT Computer Repair services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span>Service Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                MR-ROBOT provides professional computer repair and technical support services including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Hardware diagnostics and repair</li>
                <li>Software installation and troubleshooting</li>
                <li>Virus removal and system optimization</li>
                <li>Data recovery and backup services</li>
                <li>Network setup and configuration</li>
                <li>Cybersecurity assessments</li>
                <li>Operating system installation and upgrades</li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-primary" />
                <span>Service Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Appointments & Scheduling</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Appointments must be scheduled in advance</li>
                  <li>24-hour notice required for cancellations</li>
                  <li>Late arrivals may result in rescheduling</li>
                  <li>Emergency services available with additional fees</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Service Fees & Payment</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>All services require payment before completion</li>
                  <li>Diagnostic fees apply to all service calls</li>
                  <li>Additional parts and software costs are separate</li>
                  <li>Payment methods: Cash, Bank Transfer, Mobile Payment</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Warranty & Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>Warranty & Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Service Warranty</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>30-day warranty on all repair work</li>
                  <li>Warranty covers workmanship, not parts</li>
                  <li>Warranty void if device is modified by others</li>
                  <li>Data recovery services have no guarantee</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Liability Limitations</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>We are not responsible for data loss during repairs</li>
                  <li>Customers should backup data before service</li>
                  <li>Liability limited to cost of service provided</li>
                  <li>No liability for consequential or indirect damages</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Customer Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <span>Customer Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                As a customer, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate information about your device and issues</li>
                <li>Backup important data before service</li>
                <li>Remove personal items and accessories</li>
                <li>Provide necessary passwords and access codes</li>
                <li>Pay for services as agreed</li>
                <li>Pick up devices within 30 days of completion</li>
                <li>Report any issues with completed work promptly</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We respect your privacy and handle your data according to our Privacy Policy. We will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Keep your personal information confidential</li>
                <li>Only access data necessary for service provision</li>
                <li>Not share your information with third parties without consent</li>
                <li>Secure your data with industry-standard measures</li>
                <li>Delete data when no longer needed for service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Service Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to refuse or terminate service for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Abusive or threatening behavior</li>
                <li>Non-payment of services</li>
                <li>Illegal or unethical requests</li>
                <li>Devices with illegal content</li>
                <li>Violation of these terms</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> mr.robotcomputerservice@gmail.com</p>
                <p><strong>Phone:</strong> +95 9 790 525 598</p>
                <p><strong>Address:</strong> 16°47'31.1"N 96°07'36.2"E</p>
                <p><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Terms;
