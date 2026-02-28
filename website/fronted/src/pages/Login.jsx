import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ArrowLeft, Search, Package } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/config';

const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const TrackRepair = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const isEmail = query.includes('@');
      const param = isEmail ? `email=${encodeURIComponent(query)}` : `booking_id=${query}`;
      const response = await fetch(`${API_ENDPOINTS.BOOKINGS_TRACK}?${param}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message || 'No bookings found.');
      }
    } catch (err) {
      setError('Unable to connect. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-hero-bg text-hero-text py-20">
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="block text-hero-text">Track Your</span>
              <span className="block text-hero-text/90">Repair</span>
            </h1>
            <p className="text-xl text-hero-text/90 max-w-3xl mb-8">
              Enter your booking ID or email address to check your repair status.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-white/20"></div>

      <section className="py-16 bg-muted-light">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-foreground">Find Your Booking</CardTitle>
                <CardDescription>
                  Use the booking ID from your receipt, or the email you used when booking.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleTrack} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="track-query" className="text-foreground font-medium">
                      Booking ID or Email
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="track-query"
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setError(''); }}
                        className="pl-10 border-border"
                        placeholder="e.g. 42 or your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Track Repair'}
                  </Button>
                </form>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {results && results.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  {results.length === 1 ? 'Your Booking' : `Your Bookings (${results.length})`}
                </h2>
                {results.map((booking) => {
                  const status = STATUS_LABELS[booking.status] || STATUS_LABELS.pending;
                  return (
                    <Card key={booking.id} className="border shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                            <h3 className="text-lg font-bold text-foreground">
                              {booking.service_name || 'Service'}
                            </h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {booking.device_type && (
                            <div>
                              <p className="text-muted-foreground">Device</p>
                              <p className="font-medium text-foreground">{booking.device_type}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Booked</p>
                            <p className="font-medium text-foreground">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {booking.preferred_date && (
                            <div>
                              <p className="text-muted-foreground">Preferred Date</p>
                              <p className="font-medium text-foreground">
                                {new Date(booking.preferred_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {booking.service_price && (
                            <div>
                              <p className="text-muted-foreground">Price</p>
                              <p className="font-medium text-foreground">
                                {Number(booking.service_price).toLocaleString()} MMK
                              </p>
                            </div>
                          )}
                        </div>

                        {booking.issue_description && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">Issue</p>
                            <p className="text-sm text-foreground">{booking.issue_description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Don't have a booking yet?
              </p>
              <Link to="/contact">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Book a Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-tan/30"></div>
    </div>
  );
};

export default TrackRepair;
