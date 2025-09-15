import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { API_BASE_URL } from '../utils/config';

const FinancialDashboard = () => {
  const [data, setData] = useState({ totalRevenue: 0, totalExpenses: 0, outstandingAmount: 0, profit: 0, recentInvoices: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/financial/dashboard`);
        const json = await res.json().catch(() => ({ success: false }));
        if (json && json.success) setData(json.data || data);
      } catch (e) {
        setError('Unable to load financial data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <Button onClick={() => window.location.assign('/admin/dashboard')} variant="outline">Back to Admin</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader><CardContent>{data.totalRevenue.toLocaleString()} MMK</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader><CardContent>{data.totalExpenses.toLocaleString()} MMK</CardContent></Card>
          <Card><CardHeader><CardTitle>Outstanding</CardTitle></CardHeader><CardContent>{data.outstandingAmount.toLocaleString()} MMK</CardContent></Card>
          <Card><CardHeader><CardTitle>Profit</CardTitle></CardHeader><CardContent>{data.profit.toLocaleString()} MMK</CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {!loading && (!data.recentInvoices || data.recentInvoices.length === 0) && !error && (
              <div className="text-sm text-muted-foreground">No invoices yet.</div>
            )}
            <div className="space-y-2">
              {(data.recentInvoices || []).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <div className="font-medium">{inv.invoice_number}</div>
                    <div className="text-sm text-muted-foreground">{inv.customer_name || '—'}</div>
                  </div>
                  <div className="text-sm">{inv.total_amount.toLocaleString()} MMK</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;

