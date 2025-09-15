import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { API_BASE_URL } from '../utils/config';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  User, 
  Calendar, 
  Package, 
  FileText,
  Edit,
  Save,
  X,
  Camera,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: user?.address || '',
    profilePicture: user?.picture || null
  });
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.address || '',
        profilePicture: user.picture || null
      });
    }
  }, [user]);

  // Fetch user bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token || !user?.id) {
          console.log('No token or user ID:', { token: !!token, userId: user?.id });
          return;
        }
        
        console.log('Fetching bookings for user ID:', user.id);
        const response = await fetch(`${API_BASE_URL}/api/bookings/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('User bookings response:', data);
          if (data.success && data.data && data.data.bookings) {
            setUserBookings(data.data.bookings);
          } else {
            setUserBookings([]);
          }
        } else {
          console.warn('Failed to fetch user bookings:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch user bookings:', error);
      }
    };

    // Fetch articles with better error handling
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/articles`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.articles) {
            setArticles(data.data.articles);
          }
        } else {
          console.warn('Failed to fetch articles:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setArticlesLoading(false);
      }
    };

    if (user) {
      fetchUserBookings();
      fetchArticles();
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await updateProfile(profileForm);
      setIsEditing(false);
      toast({
        title: "Profile Updated Successfully!",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({
          ...profileForm,
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oxford-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied only after loading is complete and no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please log in to access your dashboard.</p>
          <Button onClick={() => navigate('/login')} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">


      {/* Simple Header with User Info and Logout */}
      <div className="bg-tan dark:bg-oxford-blue border-b border-oxford-blue dark:border-tan py-4">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="bg-oxford-blue dark:bg-tan text-tan dark:text-oxford-blue text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-oxford-blue dark:text-tan">Welcome, {user.name || user.email?.split('@')[0] || 'User'}</h2>
                <p className="text-sm text-oxford-blue/80 dark:text-tan/80">Manage your profile and services</p>
              </div>
            </div>
            <Button 
              onClick={logout} 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-oxford-blue dark:border-tan bg-tan dark:bg-oxford-blue">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'services', label: 'Services', icon: Package },
              { id: 'knowledge', label: 'Knowledge', icon: FileText },
              { id: 'bookings', label: 'Bookings', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-oxford-blue dark:border-tan text-oxford-blue dark:text-tan'
                      : 'border-transparent text-oxford-blue/70 dark:text-tan/70 hover:text-oxford-blue dark:hover:text-tan hover:border-oxford-blue/30 dark:hover:border-tan/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleProfileUpdate} disabled={loading} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 mx-auto mb-4">
                      <AvatarImage src={profileForm.profilePicture} alt={profileForm.name} />
                      <AvatarFallback className="bg-oxford-blue dark:bg-tan text-tan dark:text-oxford-blue text-2xl">
                        {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-oxford-blue dark:bg-tan text-tan dark:text-oxford-blue p-2 rounded-full cursor-pointer hover:bg-oxford-blue/80 dark:hover:bg-tan/80/80">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {isEditing && (
                    <p className="text-sm text-gray-500">Click camera icon to change picture</p>
                  )}
                </CardContent>
              </Card>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            placeholder="95912345678"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={profileForm.address}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profileForm.bio}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">MR-ROBOT Services</h2>
              <Button onClick={() => window.open('/services', '_blank')} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
                View All Services
              </Button>
            </div>
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-oxford-blue dark:text-tan mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Professional Computer Services</h3>
                <p className="text-gray-500 mb-4">Access our full range of computer repair and cybersecurity services</p>
                <div className="flex space-x-4 justify-center">
                  <Button onClick={() => window.open('/services', '_blank')} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
                    Browse Services
                  </Button>
                  <Button onClick={() => window.open('/contact', '_blank')} variant="outline">
                    Book Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Knowledge & Articles</h2>
              <Button onClick={() => window.open('/knowledge', '_blank')} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
                View All Articles
              </Button>
            </div>
            {articlesLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-oxford-blue dark:text-tan mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Loading Articles...</h3>
                  <p className="text-gray-500 mb-4">Fetching latest knowledge content from Medium</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </CardContent>
              </Card>
            ) : articles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-oxford-blue dark:text-tan mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Articles Available</h3>
                  <p className="text-gray-500 mb-4">Check back later for new knowledge content</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, 6).map((article, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.description || 'No description available'}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(article.link, '_blank')}
                        className="w-full"
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Button onClick={() => window.open('/contact', '_blank')} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
                Book New Service
              </Button>
            </div>
            
            {!userBookings || userBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-16 w-16 text-oxford-blue dark:text-tan mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't made any service bookings yet</p>
                  <Button onClick={() => window.open('/contact', '_blank')} className="bg-oxford-blue dark:bg-tan hover:bg-oxford-blue/80 dark:hover:bg-tan/80">
                    Book Your First Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userBookings && Array.isArray(userBookings) && userBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Service #{booking.id}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                            </div>
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            booking.status === 'completed' ? 'default' :
                            booking.status === 'in_progress' ? 'secondary' :
                            booking.status === 'pending' ? 'outline' : 'destructive'
                          }
                          className="ml-2"
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
                          <Label className="text-sm font-medium text-gray-600">Device Type</Label>
                          <p className="text-sm">{booking.device_type}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Urgency</Label>
                          <p className="text-sm capitalize">{booking.urgency}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Service</Label>
                          <p className="text-sm">{booking.service_name || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Price</Label>
                          <p className="text-sm font-semibold text-green-600">
                            {booking.service_price ? `${booking.service_price} MMK` : 'Price on request'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-600">Issue Description</Label>
                        <p className="text-sm text-gray-700 mt-1">{booking.issue_description}</p>
                      </div>
                      {booking.notes && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium text-gray-600">Additional Notes</Label>
                          <p className="text-sm text-gray-700 mt-1">{booking.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
