import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Download, Calendar, User, Phone, Mail, Wrench, AlertCircle } from 'lucide-react';

const BookingReceipt = ({ booking, onClose }) => {
  const downloadReceipt = () => {
    // Create a beautiful PNG receipt using HTML5 Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 800;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#1e3c72';
    ctx.fillRect(0, 0, canvas.width, 80);
    
    // Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MR-ROBOT', canvas.width / 2, 35);
    
    // Tagline
    ctx.font = '12px Arial';
    ctx.fillText('Computer Repair Service', canvas.width / 2, 55);
    
    // Receipt title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('BOOKING RECEIPT', canvas.width / 2, 120);
    
    // Booking ID
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(20, 140, canvas.width - 40, 50);
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Booking ID', 30, 160);
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`#${booking.id}`, 30, 180);
    
    // Customer info
    let yPos = 220;
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Customer Information', 20, yPos);
    yPos += 20;
    
    ctx.fillStyle = '#333333';
    ctx.font = '13px Arial';
    ctx.fillText(`Name: ${booking.customer_name}`, 20, yPos);
    yPos += 15;
    ctx.fillText(`Email: ${booking.customer_email}`, 20, yPos);
    yPos += 15;
    ctx.fillText(`Phone: ${booking.customer_phone}`, 20, yPos);
    yPos += 30;
    
    // Service details
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Service Details', 20, yPos);
    yPos += 20;
    
    ctx.fillStyle = '#333333';
    ctx.font = '13px Arial';
    ctx.fillText(`Service: ${booking.service_name || 'Computer Repair Service'}`, 20, yPos);
    yPos += 15;
    ctx.fillText(`Device: ${booking.device_type || 'Not specified'}`, 20, yPos);
    yPos += 15;
    ctx.fillText(`Urgency: ${booking.urgency}`, 20, yPos);
    yPos += 15;
    ctx.fillText(`Preferred Date: ${booking.preferred_date}`, 20, yPos);
    yPos += 30;
    
    // Pricing
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Pricing', 20, yPos);
    yPos += 20;
    
    const servicePrice = booking.service_price || 0;
    const urgencyFee = booking.urgency === 'urgent' ? 20 : booking.urgency === 'high' ? 10 : 0;
    const totalPrice = parseFloat(servicePrice) + urgencyFee;
    
    ctx.fillStyle = '#333333';
    ctx.font = '13px Arial';
    ctx.fillText(`Service Fee: $${servicePrice}`, 20, yPos);
    yPos += 15;
    ctx.fillText(`Urgency Fee: ${urgencyFee > 0 ? '+$' + urgencyFee : 'Included'}`, 20, yPos);
    yPos += 15;
    
    // Total
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Total: $${totalPrice.toFixed(2)}`, 20, yPos);
    yPos += 40;
    
    // Status
    ctx.fillStyle = '#1e3c72';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Status', 20, yPos);
    yPos += 20;
    
    ctx.fillStyle = '#333333';
    ctx.font = '13px Arial';
    ctx.fillText(`Current Status: ${booking.status}`, 20, yPos);
    yPos += 15;
    ctx.fillText(`Booking Date: ${new Date(booking.created_at).toLocaleDateString()}`, 20, yPos);
    yPos += 40;
    
    // Footer
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MR ROBOT COMPUTER REPAIR WITH A SMILE', canvas.width / 2, yPos);
    yPos += 15;
    ctx.fillText('Phone: +95 9 790 525 598', canvas.width / 2, yPos);
    yPos += 15;
    ctx.fillText('Email: mr.robotcomputerservice@gmail.com', canvas.width / 2, yPos);
    
    // Convert to PNG and download
    canvas.toBlob((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MR-ROBOT-Booking-${booking.id}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Booking Receipt</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking ID */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">Booking ID: #{booking.id}</h3>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(booking.created_at).toLocaleString()}
            </p>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Customer Details</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{booking.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{booking.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{booking.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Service Details</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{booking.service_name || 'Computer Repair Service'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Device Type</p>
                <p className="font-medium">{booking.device_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgency</p>
                <p className="font-medium capitalize">{booking.urgency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Date</p>
                <p className="font-medium">{booking.preferred_date}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issue Description</p>
              <p className="font-medium">{booking.issue_description}</p>
            </div>
            {booking.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Additional Notes</p>
                <p className="font-medium">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Status</span>
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                booking.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button onClick={downloadReceipt} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingReceipt;
