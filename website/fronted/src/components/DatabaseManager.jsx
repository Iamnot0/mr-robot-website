import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../hooks/use-toast';
import { API_ENDPOINTS } from '../utils/config';
import { 
  Database, 
  Server, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Cloud,
  Globe
} from 'lucide-react';

const DatabaseManager = () => {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState({ aws: false, azure: false });
  const { toast } = useToast();

  // Fetch current database status
  const fetchDbStatus = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/admin/database/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDbStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch database status:', error);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  // Switch database provider
  const switchDatabase = async (provider) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/admin/database/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ provider })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Database Switch Initiated",
          description: data.message,
        });
        
        // Refresh status
        setTimeout(() => {
          fetchDbStatus();
        }, 1000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Test database connection
  const testConnection = async (provider) => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    try {
      const response = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/admin/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ provider })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Connection Test Successful",
          description: `${provider.toUpperCase()} database is accessible`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: `${provider.toUpperCase()}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const getStatusIcon = (provider) => {
    if (dbStatus?.currentProvider === provider) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (provider) => {
    if (dbStatus?.currentProvider === provider) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
    return <Badge variant="outline">Standby</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-6 w-6" />
            <span>Database Management</span>
          </CardTitle>
          <CardDescription>
            Manage your database connections and switch between AWS and Azure providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          {dbStatus && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Server className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Current Database</p>
                    <p className="text-sm text-muted-foreground">
                      {dbStatus.currentProvider.toUpperCase()} - {dbStatus.host}
                    </p>
                  </div>
                </div>
                <Badge variant={dbStatus.isAWS ? "default" : "secondary"}>
                  {dbStatus.currentProvider.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}

          {/* Database Providers */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* AWS Database */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">AWS Database</CardTitle>
                  </div>
                  {getStatusIcon('aws')}
                </div>
                <CardDescription>Primary database server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge('aws')}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('aws')}
                    disabled={testing.aws}
                    className="flex-1"
                  >
                    {testing.aws ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Test
                  </Button>
                  
                  <Button
                    variant={dbStatus?.isAWS ? "secondary" : "default"}
                    size="sm"
                    onClick={() => switchDatabase('aws')}
                    disabled={loading || dbStatus?.isAWS}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Server className="h-4 w-4 mr-2" />
                    )}
                    {dbStatus?.isAWS ? 'Active' : 'Switch'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Azure Database */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Azure Database</CardTitle>
                  </div>
                  {getStatusIcon('azure')}
                </div>
                <CardDescription>Backup database server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge('azure')}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('azure')}
                    disabled={testing.azure}
                    className="flex-1"
                  >
                    {testing.azure ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Test
                  </Button>
                  
                  <Button
                    variant={dbStatus?.isAzure ? "secondary" : "default"}
                    size="sm"
                    onClick={() => switchDatabase('azure')}
                    disabled={loading || dbStatus?.isAzure}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Server className="h-4 w-4 mr-2" />
                    )}
                    {dbStatus?.isAzure ? 'Active' : 'Switch'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  Important Notice
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Switching databases requires an application restart to take effect. 
                  Make sure to restart your server after switching.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManager;
