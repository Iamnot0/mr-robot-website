import React from 'react';
import { HashRouter as BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import LiveChatConfig from './components/LiveChatConfig';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Services from './pages/Services';
import ServiceCategory from './pages/ServiceCategory';
import Knowledge from './pages/Knowledge';
import ArticleView from './pages/ArticleView';
import ArticleEditor from './pages/ArticleEditor';
import Contact from './pages/Contact';
import UserDashboard from './pages/userDashboard';

function AppContent() {
  const location = useLocation();
  const isUserDashboard = location.pathname === '/userDashboard';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="App bg-background text-foreground transition-colors duration-300">
      {!isUserDashboard && !isAdminPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/article/new" element={<ArticleEditor />} />
          <Route path="/admin/article/:id/edit" element={<ArticleEditor />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:categoryId" element={<ServiceCategory />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/article/:slug" element={<ArticleView />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/userDashboard" element={<UserDashboard />} />
        </Routes>
      </main>
      {!isUserDashboard && !isAdminPage && <Footer />}
      <ThemeToggle />
      {!isAdminPage && <LiveChatConfig />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CategoryProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </CategoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;