import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';

const CRMDashboard = () => {
  const [segments, setSegments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOverview, setSelectedOverview] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Segments (public)
        const segRes = await fetch(`${API_BASE_URL}/api/crm/segments`);
        const segJson = await segRes.json().catch(() => ({ success: false }));
        if (segJson && segJson.success) setSegments(segJson.data || []);

        // Customers (admin)
        const token = localStorage.getItem('adminToken');
        if (token) {
          const usersRes = await fetch(API_ENDPOINTS.ADMIN_USERS, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const usersJson = await usersRes.json().catch(() => ({ success: false }));
          if (usersJson && usersJson.success) setCustomers(usersJson.data?.users || []);
        }
      } catch (e) {
        setError('Unable to load CRM data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const viewOverview = async (customerId) => {
    try {
      setOverviewLoading(true);
      setSelectedOverview(null);
      setCommunications([]);
      setServiceHistory([]);

      const [ovRes, commRes, histRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/crm/customers/${customerId}/overview`),
        fetch(`${API_BASE_URL}/api/crm/customers/${customerId}/communications`),
        fetch(`${API_BASE_URL}/api/crm/customers/${customerId}/history`)
      ]);

      const [ovJson, commJson, histJson] = await Promise.all([
        ovRes.json().catch(() => ({})),
        commRes.json().catch(() => ({})),
        histRes.json().catch(() => ({}))
      ]);

      if (ovJson && ovJson.success) setSelectedOverview(ovJson.data);
      if (commJson && commJson.success) setCommunications(commJson.data || []);
      if (histJson && histJson.success) setServiceHistory(histJson.data || []);
    } catch (_) {
      // noop
    } finally {
      setOverviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <Button onClick={() => window.location.assign('/admin/dashboard')} variant="outline">Back to Admin</Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Customers</CardTitle></CardHeader>
            <CardContent>{customers.length}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Active Segments</CardTitle></CardHeader>
            <CardContent>{segments.length}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Known Communications</CardTitle></CardHeader>
            <CardContent>Use customer view</CardContent>
          </Card>
        </div>

        {/* Segments */}
        <Card>
          <CardHeader><CardTitle>Customer Segments</CardTitle></CardHeader>
          <CardContent>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {!loading && !segments.length && !error && (
              <div className="text-sm text-muted-foreground">No segments yet.</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {segments.map((seg) => (
                <Card key={seg.id}>
                  <CardHeader><CardTitle className="text-lg">{seg.name}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">{seg.description || '—'}</div>
                    <div className="mt-2 text-sm">Customers: {seg.customer_count || 0}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customers table */}
        <Card>
          <CardHeader><CardTitle>Customers</CardTitle></CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No customers yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b">
                        <td className="py-2 pr-4">{c.name}</td>
                        <td className="py-2 pr-4">{c.email}</td>
                        <td className="py-2 pr-4">{c.role}</td>
                        <td className="py-2">
                          <Button size="sm" onClick={() => viewOverview(c.id)}>View Overview</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected customer overview */}
        {selectedOverview && (
          <Card>
            <CardHeader><CardTitle>Customer Overview</CardTitle></CardHeader>
            <CardContent>
              {overviewLoading && <div className="mb-3">Loading...</div>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Name</Label>
                  <div>{selectedOverview.customer?.name}</div>
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <div>{selectedOverview.customer?.email}</div>
                </div>
                <div>
                  <Label className="text-sm">Bookings</Label>
                  <div>{selectedOverview.stats?.bookings || 0}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card><CardHeader><CardTitle className="text-sm">Communications</CardTitle></CardHeader><CardContent>{selectedOverview.stats?.communications || 0}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Service History</CardTitle></CardHeader><CardContent>{selectedOverview.stats?.serviceHistory || 0}</CardContent></Card>
              </div>

              {/* Communications list */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Recent Communications</h3>
                {communications.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No communications yet.</div>
                ) : (
                  <div className="space-y-2">
                    {communications.slice(0, 5).map((c) => (
                      <div key={c.id} className="border rounded p-3">
                        <div className="flex justify-between text-sm">
                          <div className="font-medium">{c.subject}</div>
                          <div className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                        </div>
                        <div className="text-sm mt-1">{c.content}</div>
                        <div className="text-xs text-muted-foreground mt-1">{c.communication_type} • {c.direction}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking history list */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Booking History</h3>
                {serviceHistory.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No booking history yet.</div>
                ) : (
                  <div className="space-y-2">
                    {serviceHistory.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between">
                          <div className="font-medium">{booking.service_name || 'Service'}</div>
                          <div className="text-muted-foreground">{new Date(booking.created_at).toLocaleString()}</div>
                        </div>
                        <div className="mt-1">
                          <div><strong>Device:</strong> {booking.device_type}</div>
                          <div><strong>Issue:</strong> {booking.issue_description}</div>
                          <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{booking.status}</span></div>
                          <div><strong>Service Price:</strong> {booking.service_price ? `${booking.service_price} MMK` : 'Price on request'}</div>
                          {booking.cost && <div><strong>Final Cost:</strong> {booking.cost} MMK</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CRMDashboard;

