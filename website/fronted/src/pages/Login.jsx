import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ArrowLeft, Eye, EyeOff, User, Lock } from 'lucide-react';
import { API_BASE_URL } from '../utils/config';
import { useAuth } from '../components/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Use AuthContext register function
        const result = await register({
          name: formData.username,
          email: formData.email,
          password: formData.password,
        });

        if (result.success) {
          navigate('/userDashboard');
        }
      } else {
        // Use AuthContext login function
        const result = await login({
          email: formData.username, // using username field as email for sign-in
          password: formData.password,
        });

        if (result.success) {
          navigate('/userDashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>


      {/* Main Login Card */}
      <Card className="w-full max-w-md max-sm:max-w-sm bg-card shadow-lg rounded-2xl border-border">
        <CardHeader className="text-center pb-6">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <img 
                src="/logo.png"
                alt="MR-ROBOT Logo"
              className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.src = '/logo (copy 1).png';
                }}
              />
            </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-1">
            MR ROBOT
          </h1>
          
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground">
            {isSignUp ? 'Create Account' : 'Client Portal'}
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                !isSignUp 
                  ? 'text-primary border-primary' 
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                isSignUp 
                  ? 'text-primary border-primary' 
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
              <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">
                Username
              </Label>
                <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                  id="username"
                  name="username"
                    type="text"
                  value={formData.username}
                    onChange={handleInputChange}
                  className="w-full pl-10 border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

            {/* Email (Sign Up only) */}
            {isSignUp && (
            <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Confirm your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              All login activities are monitored for security purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;