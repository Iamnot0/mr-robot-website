import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Settings, 
  Users, 
  FileText, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  Database,
  CheckCircle,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  RefreshCw,
  Calendar,
  Mail,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useCategories } from '../contexts/CategoryContext';
import { API_ENDPOINTS, getServiceUrl, getCategoryUrl } from '../utils/config';
import { formatPrice } from '../utils/currency';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import DatabaseManager from '../components/DatabaseManager';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  // Admin-specific logout function
  const adminLogout = () => {
    // Clear admin tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Also clear regular auth tokens if they exist
    localStorage.removeItem('authToken');
    
    // Show success message
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to admin login
    navigate('/admin/login');
  };
  const { serviceCategories, knowledgeCategories, refreshCategories, loading: categoriesLoading } = useCategories();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [services, setServices] = useState([]);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalServices: 0,
    totalCategories: 0,
    totalArticles: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalContacts: 0
  });
  const [loading, setLoading] = useState(false);

  // Form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedCategoryType, setSelectedCategoryType] = useState('services');

  // Service form
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    is_active: 1
  });

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Package',
    color: 'Blue',
    type: 'services'
  });

  // User form
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'Client',
    status: 'active'
  });


  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUser) {
      toast({
        title: "Access Denied",
        description: "Please log in to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/admin/login');
      return;
    }
    
    fetchData();
  }, [navigate, toast]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login to access admin panel",
          variant: "destructive"
        });
        return;
      }


      // Fetch dashboard stats
      const dashboardResponse = await fetch(API_ENDPOINTS.ADMIN_DASHBOARD, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dashboardData = await dashboardResponse.json();
      if (dashboardData.success) {
        setDashboardStats(dashboardData.data.stats);
        setServices(dashboardData.data.recentServices || []);
        setArticles(dashboardData.data.recentArticles || []);
      }

      // Fetch services
      const servicesResponse = await fetch(API_ENDPOINTS.ADMIN_SERVICES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const servicesData = await servicesResponse.json();
      if (servicesData.success) setServices(servicesData.data);


      // Fetch articles from database
      const articlesResponse = await fetch(API_ENDPOINTS.ADMIN_ARTICLES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const articlesData = await articlesResponse.json();
      if (articlesData.success) {
        setArticles(articlesData.data || []);
      } else {
        console.error('Failed to fetch articles:', articlesData.message);
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive"
        });
      }

      // Fetch users from database
      const usersResponse = await fetch(API_ENDPOINTS.ADMIN_USERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setUsers(usersData.data.users || []);
      }

      // Fetch bookings from database
      const bookingsResponse = await fetch(API_ENDPOINTS.ADMIN_BOOKINGS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingsData = await bookingsResponse.json();
      if (bookingsData.success) {
        setBookings(bookingsData.data.bookings || []);
      }

      // Fetch contacts from database
      const contactsResponse = await fetch(API_ENDPOINTS.ADMIN_CONTACTS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contactsData = await contactsResponse.json();
      if (contactsData.success) {
        setContacts(contactsData.data.contacts || []);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      if (editingUser) {
        // Update existing user
        const response = await fetch(`${API_ENDPOINTS.ADMIN_USERS}/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: userForm.name,
            email: userForm.email,
            phone: userForm.phone || '',
            role: userForm.role,
            status: userForm.status
          })
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "User updated successfully"
          });
        } else {
          throw new Error('Failed to update user');
        }
      } else {
        // Add new user
        const response = await fetch(API_ENDPOINTS.ADMIN_USERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: userForm.name,
            email: userForm.email,
            phone: userForm.phone || '',
            role: userForm.role || 'client',
            status: userForm.status || 'active'
          })
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "User created successfully"
          });
        } else {
          throw new Error('Failed to create user');
        }
      }
      
      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', role: 'Client', status: 'active' });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "User deleted successfully"
          });
          fetchData();
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        });
      }
    }
  };


  const handleDeleteArticle = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_ENDPOINTS.ADMIN_ARTICLES}/${articleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "Article deleted successfully"
          });
          fetchData();
        } else {
          throw new Error('Failed to delete article');
        }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive"
      });
    }
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    
    if (!serviceForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Service name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!serviceForm.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Service category is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!serviceForm.price || isNaN(serviceForm.price) || serviceForm.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid service price is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!serviceForm.duration.trim()) {
      toast({
        title: "Validation Error",
        description: "Service duration is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingService 
        ? getServiceUrl(editingService.id)
        : API_ENDPOINTS.ADMIN_SERVICES;
      
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || (editingService ? "Service updated successfully" : "Service created successfully")
        });
        setShowServiceForm(false);
        setEditingService(null);
        setServiceForm({ name: '', description: '', price: '', duration: '', category: '', is_active: 1 });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save service",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive"
      });
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (categoryForm.type === 'services') {
        const url = editingCategory 
          ? getCategoryUrl(editingCategory.id)
          : API_ENDPOINTS.ADMIN_CATEGORIES;
        
        const response = await fetch(url, {
          method: editingCategory ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(categoryForm)
        });

        const data = await response.json();
        if (data.success) {
          toast({
            title: "Success",
            description: data.message || (editingCategory ? "Service category updated successfully" : "Service category created successfully")
          });
          setShowCategoryForm(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', description: '', icon: 'Package', color: 'Blue', type: 'services' });
          refreshCategories();
        } else {
          throw new Error(data.message || 'Failed to save category');
        }
      } else {
        // For knowledge categories, create a placeholder article
        const articleData = {
          title: `Category: ${categoryForm.name}`,
          description: `This is a placeholder article for the ${categoryForm.name} category. You can delete this article after creating real content.`,
          content: `<p>This category was created manually. Add real articles to this category to replace this placeholder.</p>`,
          category: categoryForm.name,
          source: 'admin',
          is_published: false
        };

        const articleResponse = await fetch(`${API_ENDPOINTS.API_BASE_URL}/api/admin/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(articleData)
        });

        const articleResult = await articleResponse.json();
        if (articleResult.success) {
          toast({
            title: "Success",
            description: `Knowledge category "${categoryForm.name}" created successfully. You can now add articles to this category.`
          });
          setShowCategoryForm(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', description: '', icon: 'Package', color: 'Blue', type: 'knowledge' });
          refreshCategories();
        } else {
          throw new Error(articleResult.message || `Failed to create knowledge category`);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      });
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getServiceUrl(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: data.message || "Service deleted successfully" });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete service",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      });
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      
      if (selectedCategoryType === 'services') {
        // Delete service category
        const response = await fetch(getCategoryUrl(id), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: data.message || "Service category deleted successfully" });
          fetchData();
        } else {
          toast({
            title: "Cannot Delete Category",
            description: data.message || "Failed to delete service category",
            variant: "destructive"
          });
        }
      } else {
        // For knowledge categories, we need to find and delete the placeholder article
        const response = await fetch(`${API_ENDPOINTS.ADMIN_ARTICLES}?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success && data.data && data.data.articles) {
          // Find the placeholder article for this category
          const placeholderArticle = data.data.articles.find(article => 
            article.title.startsWith('Category: ') && article.category === id
          );
          
          if (placeholderArticle) {
            // Delete the placeholder article
            const deleteResponse = await fetch(`${API_ENDPOINTS.ADMIN_ARTICLES}/${placeholderArticle.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const deleteData = await deleteResponse.json();
            if (deleteData.success) {
              toast({
                title: "Success",
                description: "Knowledge category deleted successfully"
              });
              fetchData();
            } else {
              toast({
                title: "Cannot Delete Category",
                description: deleteData.message || "Failed to delete knowledge category",
                variant: "destructive"
              });
            }
          } else {
            toast({
              title: "Cannot Delete Category",
              description: "Placeholder article not found for this category",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Cannot Delete Category",
            description: "Failed to fetch articles",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const editService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      is_active: service.is_active
    });
    setShowServiceForm(true);
  };

  const addCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      icon: 'Package',
      color: 'Blue',
      type: selectedCategoryType
    });
    setShowCategoryForm(true);
  };

  const editCategory = async (category) => {
    if (selectedCategoryType === 'knowledge') {
      // For knowledge categories, we need to find the placeholder article
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_ENDPOINTS.ADMIN_ARTICLES}?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success && data.data && data.data.articles) {
          // Find the placeholder article for this category
          const placeholderArticle = data.data.articles.find(article => 
            article.title.startsWith('Category: ') && article.category === category.name
          );
          
          if (placeholderArticle) {
            setEditingCategory({ ...category, articleId: placeholderArticle.id });
          } else {
            toast({
              title: "Error",
              description: "Placeholder article not found for this category",
              variant: "destructive"
            });
            return;
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch category details",
          variant: "destructive"
        });
        return;
      }
    } else {
      setEditingCategory(category);
    }
    
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon || 'Package',
      color: category.color || 'Blue',
      type: selectedCategoryType
    });
    setShowCategoryForm(true);
  };


  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'services', label: 'Service Management', icon: Package },
    { id: 'categories', label: 'Category Management', icon: Database },
    { id: 'knowledge', label: 'Knowledge Management', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'bookings', label: 'Booking Management', icon: Calendar },
    { id: 'contacts', label: 'Contact Forms', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'database', label: 'Database Management', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card 
          className="cursor-pointer transition-none" 
          onClick={() => setActiveTab('services')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalServices}</div>
            <p className="text-xs text-muted-foreground">Active services</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-none" 
          onClick={() => setActiveTab('categories')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Service categories</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-none" 
          onClick={() => setActiveTab('knowledge')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Knowledge base articles</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-none" 
          onClick={() => setActiveTab('users')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-none" 
          onClick={() => setActiveTab('bookings')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Service requests</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-none" 
          onClick={() => setActiveTab('contacts')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">Contact submissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(services) && services.slice(0, 5).map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">Contact for Pricing</p>
                  </div>
                  <Badge variant={service.is_active ? 'default' : 'secondary'} className="text-primary-foreground">
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              {(!Array.isArray(services) || services.length === 0) && (
                <p className="text-sm text-muted-foreground">No services available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(articles) && articles.slice(0, 5).map((article, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium truncate">{article.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {article.published_at 
                        ? new Date(article.published_at).toLocaleDateString() 
                        : new Date(article.created_at).toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
              ))}
              {(!Array.isArray(articles) || articles.length === 0) && (
                <p className="text-sm text-muted-foreground">No articles available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
                        <Button onClick={() => setShowServiceForm(true)} className="bg-primary hover:bg-secondary">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(services) && services.map((service, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editService(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteService(service.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{service.description}</CardDescription>
              <div className="space-y-2">
                                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Price:</span>
                      <div className="text-sm text-right">
                        <div>{service.price} MMK</div>
                        <div className="text-xs text-foreground/60">≈ ${formatPrice(service.price).usd} USD</div>
                      </div>
                    </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm">{service.duration}</span>
                </div>
                                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm text-foreground">{service.category}</span>
                  </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={service.is_active ? 'default' : 'destructive'} className="text-xs text-primary-foreground hover:bg-primary hover:bg-primary">
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCategories = () => {
    const currentCategories = selectedCategoryType === 'services' ? serviceCategories : knowledgeCategories;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Category Management</h2>
          <div className="flex space-x-4">
            <div className="flex space-x-2">
              <Button
                variant={selectedCategoryType === 'services' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategoryType('services')}
                className="bg-primary"
              >
                Service Categories
              </Button>
              <Button
                variant={selectedCategoryType === 'knowledge' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategoryType('knowledge')}
                className="bg-primary"
              >
                Knowledge Categories
              </Button>
            </div>
            
            <Button 
              onClick={addCategory} 
              className="bg-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedCategoryType === 'services' ? 'Service' : 'Knowledge'} Category
            </Button>
          </div>
        </div>

        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${selectedCategoryType === 'services' ? 'bg-primary' : 'bg-secondary'}`}></div>
            <span className="text-sm font-medium text-foreground">
              Managing {selectedCategoryType === 'services' ? 'Service' : 'Knowledge'} Categories
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedCategoryType === 'services' 
              ? 'Service categories organize your repair and technical services'
              : 'Knowledge categories organize your articles and tutorials'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(currentCategories) && currentCategories.map((category, index) => (
            <Card key={index} className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{category.description}</CardDescription>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedCategoryType === 'services' ? 'Service' : 'Knowledge'}
                    </Badge>
                  </div>
                  {selectedCategoryType === 'services' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Icon:</span>
                        <span className="text-sm">{category.icon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={category.is_active ? 'default' : 'destructive'} className="text-xs text-primary-foreground">
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categoriesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Loading categories...</h3>
          </div>
        ) : currentCategories.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No {selectedCategoryType} categories found
            </h3>
            <p className="text-muted-foreground/70 mb-4">
              {selectedCategoryType === 'services' 
                ? 'Create your first service category to organize your services'
                : 'Knowledge categories are automatically created from your articles'
              }
            </p>
            {selectedCategoryType === 'services' && (
              <Button 
                onClick={addCategory}
                className="bg-primary hover:bg-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service Category
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderKnowledge = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Articles ({Array.isArray(articles) ? articles.length : 0})</h2>
        <Button 
          className="bg-primary"
          onClick={() => navigate('/admin/article/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Article
        </Button>
      </div>

      {Array.isArray(articles) && articles.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => (
                    <tr key={index} className="border-b hover:bg-accent/50 dark:hover:bg-accent/20">
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-foreground dark:text-foreground truncate" title={article.title}>
                            {article.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate" title={article.description}>
                            {article.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={article.is_published ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {article.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(article.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                            className="text-primary border-border hover:bg-muted"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/article/${article.id}/edit`)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No articles available</p>
            <p className="text-muted-foreground/60 text-sm mt-2">Create your first article to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={fetchData}
            className="border-primary text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
                       <Button 
               className="bg-primary"
               onClick={() => {
                 setEditingUser(null);
                 setUserForm({ name: '', email: '', role: 'Client', status: 'active' });
                 setShowUserForm(true);
               }}
             >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <div className="flex space-x-2">
                                         <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleEditUser(user)}
                       >
                    <Edit className="h-4 w-4" />
                  </Button>
                                         <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleDeleteUser(user.id)}
                         className="text-red-600"
                       >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Role:</span>
                  <Badge variant="default" className="text-xs text-primary-foreground hover:bg-primary hover:bg-primary">{user.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="text-xs text-primary-foreground hover:bg-primary hover:bg-primary">
                    {user.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Joined:</span>
                  <span className="text-sm">{new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No users registered yet.</p>
            <p className="text-muted-foreground/60 text-sm mt-2">Users will appear here when they register through the client portal.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="text-oxford-blue dark:text-tan border-oxford-blue dark:border-tan hover:bg-oxford-blue/10 dark:hover:bg-tan/10"
            onClick={async () => {
              if (window.confirm('Are you sure you want to mark ALL pending bookings as in progress?')) {
                try {
                  const token = localStorage.getItem('adminToken');
                  const response = await fetch(`${API_ENDPOINTS.ADMIN_BOOKINGS}/mark-all-progress`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  const data = await response.json();
                  if (response.ok && data.success) {
                    await fetchData(); // Refresh data from server
                    toast({
                      title: "Mark All Progress Successful",
                      description: `Marked ${data.updated_count || 0} bookings as in progress`
                    });
                  } else {
                    throw new Error(data.message || 'Failed to mark bookings as in progress');
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to mark all bookings as in progress",
                    variant: "destructive"
                  });
                }
              }
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Progress
          </Button>
          <Button 
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete ALL finished bookings (completed + cancelled)? This action cannot be undone.')) {
                try {
                  const token = localStorage.getItem('adminToken');
                  const response = await fetch(`${API_ENDPOINTS.ADMIN_BOOKINGS}/finished`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    await fetchData(); // Refresh data from server
                    toast({
                      title: "Bulk Delete Successful",
                      description: `Deleted ${data.deleted_count || 0} finished bookings`
                    });
                  } else {
                    throw new Error('Failed to delete bookings');
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to delete finished bookings",
                    variant: "destructive"
                  });
                }
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Finished
          </Button>
          <Button 
            variant="outline"
            onClick={fetchData}
            className="border-primary text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Array.isArray(bookings) && bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Service #{booking.id}</CardTitle>
                  <Badge 
                    variant={
                      booking.status === 'completed' ? 'default' :
                      booking.status === 'in_progress' ? 'secondary' :
                      booking.status === 'pending' ? 'outline' : 'destructive'
                    }
                  >
                    {booking.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {booking.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                    {booking.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                    <p className="text-sm text-foreground">{booking.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm text-foreground">{booking.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm text-foreground">{booking.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Device Type</Label>
                    <p className="text-sm text-foreground">{booking.device_type || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Urgency</Label>
                    <p className="text-sm capitalize text-foreground">{booking.urgency || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm text-foreground">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                    <p className="text-sm text-foreground">{booking.service_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                    <p className="text-sm text-foreground font-semibold">
                      {booking.service_price ? `${booking.service_price} MMK` : 'Price on request'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Issue Description</Label>
                  <p className="text-sm text-foreground mt-1">{booking.issue_description || 'No description'}</p>
                </div>
                {booking.notes && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-muted-foreground">Additional Notes</Label>
                    <p className="text-sm text-foreground mt-1">{booking.notes}</p>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      const newStatus = booking.status === 'pending' ? 'in_progress' : 
                                      booking.status === 'in_progress' ? 'completed' : 'pending';
                      try {
                        const token = localStorage.getItem('adminToken');
                        const response = await fetch(`${API_ENDPOINTS.ADMIN_BOOKINGS}/${booking.id}/status`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ status: newStatus })
                        });
                        
                        if (response.ok) {
                          await fetchData(); // Refresh data from server
                          toast({
                            title: "Status Updated",
                            description: `Booking status changed to ${newStatus}`
                          });
                        } else {
                          throw new Error('Failed to update status');
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update booking status",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    {booking.status === 'pending' ? 'Start Work' : 
                     booking.status === 'in_progress' ? 'Mark Complete' : 'Reset Status'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this booking? This will also remove it from the client\'s profile.')) {
                        try {
                          const token = localStorage.getItem('adminToken');
                          const response = await fetch(`${API_ENDPOINTS.ADMIN_BOOKINGS}/${booking.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          
                          if (response.ok) {
                            await fetchData(); // Refresh data from server
                            toast({
                              title: "Booking Deleted",
                              description: "Booking removed successfully"
                            });
                          } else {
                            throw new Error('Failed to delete booking');
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to delete booking",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No bookings available</p>
            <p className="text-muted-foreground/60 text-sm mt-2">Bookings will appear here when customers submit service requests</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact Form Submissions</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="text-oxford-blue dark:text-tan border-oxford-blue dark:border-tan hover:bg-oxford-blue/10 dark:hover:bg-tan/10"
            onClick={async () => {
              if (window.confirm('Are you sure you want to mark ALL messages as read?')) {
                try {
                  const token = localStorage.getItem('adminToken');
                  const response = await fetch(`${API_ENDPOINTS.ADMIN_CONTACTS}/read-all`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  const data = await response.json();
                  if (response.ok && data.success) {
                    await fetchData(); // Refresh data from server
                    toast({
                      title: "Mark All Read Successful",
                      description: `Marked ${data.updated_count || 0} messages as read`
                    });
                  } else {
                    throw new Error(data.message || 'Failed to mark messages as read');
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to mark all messages as read",
                    variant: "destructive"
                  });
                }
              }
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button 
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete ALL read messages? This action cannot be undone.')) {
                try {
                  const token = localStorage.getItem('adminToken');
                  const response = await fetch(`${API_ENDPOINTS.ADMIN_CONTACTS}/read`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  const data = await response.json();
                  if (response.ok && data.success) {
                    await fetchData(); // Refresh data from server
                    toast({
                      title: "Bulk Delete Successful",
                      description: `Deleted ${data.deleted_count || 0} read messages`
                    });
                  } else {
                    throw new Error(data.message || 'Failed to delete messages');
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to delete read messages",
                    variant: "destructive"
                  });
                }
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Read
          </Button>
          <Button 
            variant="outline"
            onClick={fetchData}
            className="border-primary text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Array.isArray(contacts) && contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Message #{contact.id}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm text-foreground">{contact.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm text-foreground">{contact.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm text-foreground">{contact.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                    <p className="text-sm text-foreground">{contact.subject || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                  <p className="text-sm text-foreground mt-1">{contact.message || 'No message'}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('adminToken');
                        const response = await fetch(`${API_ENDPOINTS.ADMIN_CONTACTS}/${contact.id}/read`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        
                        const data = await response.json();
                        if (response.ok && data.success) {
                          await fetchData(); // Refresh data from server
                          toast({
                            title: "Status Updated",
                            description: "Message marked as read"
                          });
                        } else {
                          throw new Error(data.message || 'Failed to update status');
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update message status",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Mark Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this message?')) {
                        try {
                          const token = localStorage.getItem('adminToken');
                          
                          const response = await fetch(`${API_ENDPOINTS.ADMIN_CONTACTS}/${contact.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok && data.success) {
                            await fetchData(); // Refresh data from server
                            toast({
                              title: "Message Deleted",
                              description: "Contact message removed successfully"
                            });
                          } else {
                            throw new Error(data.message || 'Failed to delete message');
                          }
                        } catch (error) {
                          console.error('Delete error:', error);
                          toast({
                            title: "Error",
                            description: `Failed to delete message: ${error.message}`,
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No contact submissions</p>
            <p className="text-muted-foreground/60 text-sm mt-2">Contact form submissions will appear here when customers send messages</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Version:</span>
              <span className="text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Environment:</span>
              <span className="text-sm">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Updated:</span>
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                if (window.confirm('This will export all data to JSON files. Continue?')) {
                  const data = {
                    users: JSON.parse(localStorage.getItem('client_users') || '[]'),
                    articles: JSON.parse(localStorage.getItem('articles') || '[]'),
                    bookings: JSON.parse(localStorage.getItem('bookings') || '[]'),
                    contacts: JSON.parse(localStorage.getItem('contact_submissions') || '[]')
                  };
                  
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mr-robot-data-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  
                  toast({
                    title: "Data Exported",
                    description: "All data has been exported successfully"
                  });
                }
              }}
            >
              Export All Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-red-600"
              onClick={() => {
                if (window.confirm('This will clear ALL data. This action cannot be undone. Are you sure?')) {
                  localStorage.clear();
                  toast({
                    title: "Data Cleared",
                    description: "All data has been cleared. Please refresh the page."
                  });
                  setTimeout(() => window.location.reload(), 2000);
                }
              }}
            >
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'services':
        return renderServices();
      case 'categories':
        return renderCategories();
      case 'knowledge':
        return renderKnowledge();
      case 'users':
        return renderUsers();
      case 'bookings':
        return renderBookings();
      case 'contacts':
        return renderContacts();
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'database':
        return <DatabaseManager />;
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <div className="bg-tan dark:bg-oxford-blue text-oxford-blue dark:text-tan p-4 admin-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-oxford-blue dark:text-tan"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="MR-ROBOT Admin Logo"
                  className="w-full h-full object-contain rounded-full bg-white"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">MR-ROBOT Computer Repair</h1>
                <p className="text-sm text-oxford-blue/80 dark:text-tan/80">
                  Welcome Admin
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 mr-4">
              <Button
                variant="ghost"
                onClick={() => window.open('/knowledge', '_blank')}
                className="text-oxford-blue dark:text-tan"
              >
                <FileText className="h-4 w-4 mr-2" />
                Knowledge
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.open('/services', '_blank')}
                className="text-oxford-blue dark:text-tan"
              >
                <Package className="h-4 w-4 mr-2" />
                Services
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={adminLogout}
              className="text-oxford-blue dark:text-tan"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {sidebarOpen && (
          <div className="w-64 bg-tan dark:bg-oxford-blue border-r border-oxford-blue dark:border-tan/20 min-h-screen admin-sidebar">
            <nav className="p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                          activeTab === item.id
                            ? 'bg-oxford-blue dark:bg-tan text-tan dark:text-oxford-blue'
                            : 'text-oxford-blue dark:text-tan hover:bg-oxford-blue/10 dark:hover:bg-tan/10 hover:text-oxford-blue dark:hover:text-tan'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        )}

        <div className="flex-1 p-6 admin-content-area">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-foreground">Loading...</div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {showServiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-primary-foreground">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-primary-foreground">Service Name</Label>
                <Input
                  id="name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                  required
                  className="text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-primary-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  required
                  className="text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-primary-foreground">Price (MMK)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                    placeholder="e.g., 30000"
                    required
                    className="text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                  />
                  <p className="text-xs text-primary-foreground/80 mt-1">
                    ≈ ${formatPrice(serviceForm.price || 0).usd} USD
                  </p>
                </div>
                <div>
                  <Label htmlFor="duration" className="text-primary-foreground">Duration</Label>
                  <Input
                    id="duration"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                    placeholder="e.g., 2 hours"
                    required
                    className="text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="text-primary-foreground">Category</Label>
                <Select
                  value={serviceForm.category}
                  onValueChange={(value) => setServiceForm({...serviceForm, category: value})}
                >
                  <SelectTrigger className="text-oxford-blue bg-white border-oxford-blue/30">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                                     <SelectContent className="bg-white border-oxford-blue/30">
                     {Array.isArray(serviceCategories) && serviceCategories.map((category) => (
                       <SelectItem key={category.id} value={category.name} className="text-oxford-blue hover:bg-oxford-blue/10">
                         {category.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-primary-foreground">Status</Label>
                <Select
                  value={serviceForm.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => setServiceForm({...serviceForm, is_active: value === 'active' ? 1 : 0})}
                >
                  <SelectTrigger className="text-oxford-blue bg-white border-oxford-blue/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-oxford-blue/30">
                    <SelectItem value="active" className="text-oxford-blue hover:bg-oxford-blue/10">Active</SelectItem>
                    <SelectItem value="inactive" className="text-oxford-blue hover:bg-oxford-blue/10">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/80">
                  {editingService ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowServiceForm(false);
                    setEditingService(null);
                    setServiceForm({ name: '', description: '', price: '', duration: '', category: '', is_active: 1 });
                  }}
                  className="flex-1 bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/80"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-primary-foreground">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <Label htmlFor="catType" className="text-primary-foreground">Category Type</Label>
                <Select
                  value={categoryForm.type}
                  onValueChange={(value) => setCategoryForm({...categoryForm, type: value})}
                >
                  <SelectTrigger className="text-oxford-blue bg-white border-oxford-blue/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-oxford-blue/30">
                    <SelectItem value="services" className="text-oxford-blue hover:bg-oxford-blue/10">Service Category</SelectItem>
                    <SelectItem value="knowledge" className="text-oxford-blue hover:bg-oxford-blue/10">Knowledge Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="catName" className="text-primary-foreground">Category Name</Label>
                <Input
                  id="catName"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                  className="text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                />
              </div>
              {categoryForm.type === 'services' && (
                <div>
                  <Label htmlFor="catDescription" className="text-primary-foreground">Description</Label>
                  <Textarea
                    id="catDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    required
                    className="text-oxford-blue placeholder:text-oxford-blue/70 bg-white border-oxford-blue/30"
                  />
                </div>
              )}
              
              {categoryForm.type === 'knowledge' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Knowledge categories don't have editable descriptions. 
                    They are automatically managed through your articles. The description will show 
                    "Articles about [Category Name]" based on the articles you create.
                  </p>
                </div>
              )}
              {categoryForm.type === 'services' && (
                <>
                  <div>
                    <Label htmlFor="catIcon" className="text-primary-foreground">Icon</Label>
                    <Select
                      value={categoryForm.icon}
                      onValueChange={(value) => setCategoryForm({...categoryForm, icon: value})}
                    >
                      <SelectTrigger className="text-oxford-blue bg-white border-oxford-blue/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-oxford-blue/30">
                        <SelectItem value="Package" className="text-oxford-blue hover:bg-oxford-blue/10">Package</SelectItem>
                        <SelectItem value="Settings" className="text-oxford-blue hover:bg-oxford-blue/10">Settings</SelectItem>
                        <SelectItem value="Shield" className="text-oxford-blue hover:bg-oxford-blue/10">Shield</SelectItem>
                        <SelectItem value="Monitor" className="text-oxford-blue hover:bg-oxford-blue/10">Monitor</SelectItem>
                        <SelectItem value="Zap" className="text-oxford-blue hover:bg-oxford-blue/10">Zap</SelectItem>
                        <SelectItem value="Globe" className="text-oxford-blue hover:bg-oxford-blue/10">Web</SelectItem>
                        <SelectItem value="Code" className="text-oxford-blue hover:bg-oxford-blue/10">Code</SelectItem>
                        <SelectItem value="Database" className="text-oxford-blue hover:bg-oxford-blue/10">Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="catColor" className="text-primary-foreground">Color Theme</Label>
                    <Select
                      value={categoryForm.color}
                      onValueChange={(value) => setCategoryForm({...categoryForm, color: value})}
                    >
                      <SelectTrigger className="text-primary-foreground bg-primary-foreground/10 border-primary-foreground/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Blue">Blue</SelectItem>
                        <SelectItem value="Gray">Gray</SelectItem>
                        <SelectItem value="Green">Green</SelectItem>
                        <SelectItem value="Purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/80">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', icon: 'Package', color: 'Blue' });
                  }}
                  className="flex-1 bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/80"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-primary-foreground">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <Label htmlFor="userName" className="text-primary-foreground">Full Name</Label>
                <Input
                  id="userName"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  required
                  className="text-primary-foreground placeholder:text-primary-foreground/70 bg-primary-foreground/10 border-primary-foreground/30"
                />
              </div>
              <div>
                <Label htmlFor="userEmail" className="text-primary-foreground">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                  className="text-primary-foreground placeholder:text-primary-foreground/70 bg-primary-foreground/10 border-primary-foreground/30"
                />
              </div>
              <div>
                <Label htmlFor="userPhone" className="text-primary-foreground">Phone</Label>
                <Input
                  id="userPhone"
                  value={userForm.phone || ''}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  placeholder="Optional phone number"
                  className="text-primary-foreground placeholder:text-primary-foreground/70 bg-primary-foreground/10 border-primary-foreground/30"
                />
              </div>
              <div>
                <Label htmlFor="userRole" className="text-primary-foreground">Role</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm({...userForm, role: value})}
                >
                  <SelectTrigger className="text-primary-foreground bg-primary-foreground/10 border-primary-foreground/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="userStatus">Status</Label>
                <Select
                  value={userForm.status}
                  onValueChange={(value) => setUserForm({...userForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/80">
                  {editingUser ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    setUserForm({ name: '', email: '', role: 'Client', status: 'active' });
                  }}
                  className="flex-1 bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/80"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
