import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../components/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  // Check if user is already logged in and redirect
  useEffect(() => {
    const currentUser = localStorage.getItem('client_user') || localStorage.getItem('user');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user && user.email) {
          // User is already logged in, redirect to dashboard
          navigate('/userDashboard');
          return;
        }
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem('client_user');
        localStorage.removeItem('user');
      }
    }
    setCheckingAuth(false);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords don't match",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Use AuthContext register function
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        if (result.success) {
          toast({
            title: "Success!",
            description: "Account created successfully",
          });
          navigate('/userDashboard');
        }
      } else {
        // Use AuthContext login function
        const result = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (result.success) {
          toast({
            title: "Welcome back!",
            description: "You've been signed in successfully",
          });
          navigate('/userDashboard');
        }
      }
    } catch (error) {
      const errorMessage = error.message || "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // TODO: Implement real Google OAuth integration
      toast({
        title: "Coming Soon",
        description: "Google sign-in will be available soon",
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error.message || "Google sign-in failed. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      
              <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-[#1F2E3F]">
        <CardHeader className="space-y-2 text-center pb-6">
                      <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto shadow-lg overflow-hidden border-2 border-white bg-white">
              <img 
                src="/logo.png"
                alt="MR-ROBOT Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = '/logo (copy 1).png';
                }}
              />
            </div>
          <CardTitle className="text-2xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Welcome '}
          </CardTitle>
          <CardDescription className="text-white/70">
            {isSignUp 
              ? 'Join with US' 
              : 'Sign in to access your account'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
                              className="w-full bg-white text-[#1F2E3F] font-medium py-2.5 transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1F2E3F] px-2 text-white/60">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
                            className="w-full border-2 border-gray-300 transition-all duration-200"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-white/70">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <Button
              type="button"
              variant="link"
                              className="p-0 h-auto font-semibold text-white transition-colors"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;