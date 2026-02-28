import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCategories } from '../contexts/CategoryContext';
import { Button } from '../ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { serviceCategories } = useCategories();
  const location = useLocation();

  const navigation = [
    {
      name: 'Services',
      href: '/services',
      description: 'Professional computer repair and cybersecurity solutions'
    },
    {
      name: 'Knowledge',
      href: '/knowledge',
      description: 'Expert articles, tutorials, and professional insights'
    },
    {
      name: 'About',
      href: '/about',
      description: 'Learn about our expertise and experience'
    }
  ];

  const generateSafeId = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <nav className="bg-navbar-bg text-navbar-text border-b-2 border-border z-50 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center group">
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src="/logo.png"  
                alt="MR-ROBOT Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-end pr-4">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  to={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-1 text-navbar-text hover:text-navbar-hover"
                >
                  <span>{item.name}</span>
                  <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                </Link>
                
                <div className={`absolute top-full left-0 mt-1 bg-card border-2 border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 z-50 ${
                  item.name === 'Knowledge' ? 'w-80' : 'w-48'
                }`}>
                  <div className="py-2">
                    {item.name === 'Services' && (
                      <>
                        {serviceCategories.map((category, index) => (
                          <Link 
                            key={index}
                            to={`/services/${generateSafeId(category.name)}`} 
                            className="block px-4 py-2 text-sm text-navbar-text hover:bg-muted hover:text-navbar-hover transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </>
                    )}
                    {item.name === 'Knowledge' && (
                      <>
                        <Link to="/knowledge?category=Computer%20Science" className="block px-4 py-2 text-sm text-navbar-text hover:bg-muted hover:text-navbar-hover transition-colors">
                          Computer Science
                        </Link>
                        <Link to="/knowledge?category=A%2B" className="block px-4 py-2 text-sm text-navbar-text hover:bg-muted hover:text-navbar-hover transition-colors">
                          A+
                        </Link>
                        <Link to="/knowledge" className="block px-4 py-2 text-sm text-primary font-semibold hover:bg-muted transition-colors border-t border-border mt-2 pt-2">
                          All Articles →
                        </Link>
                      </>
                    )}
                    {item.name === 'About' && (
                      <>
                        <Link to="/privacy" className="block px-4 py-2 text-sm text-navbar-text hover:bg-muted hover:text-navbar-hover transition-colors">
                          Privacy Policy
                        </Link>
                        <Link to="/terms" className="block px-4 py-2 text-sm text-navbar-text hover:bg-muted hover:text-navbar-hover transition-colors">
                          Terms of Service
                        </Link>
                        <Link to="/accessibility" className="block px-4 py-2 text-sm text-navbar-text hover:bg-muted hover:text-navbar-hover transition-colors">
                          Accessibility
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="ml-4">
              <Link to="/contact">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 py-2 text-sm">
                  Contact
                </Button>
              </Link>
            </div>
            <div className="ml-2">
              <Link to="/track">
                <Button variant="outline" className="border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold px-5 py-2 text-sm">
                  Track Repair
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-navbar-text"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-border py-6">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 text-navbar-text"
                >
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border">
                <div className="text-sm font-semibold text-navbar-text mb-3 px-4">SERVICES</div>
                {serviceCategories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/services/${generateSafeId(category.name)}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-navbar-text rounded-lg transition-all duration-200"
                  >
                    <span className="font-medium">{category.name}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-sm font-semibold text-navbar-text mb-3 px-4">KNOWLEDGE</div>
                <Link
                  to="/knowledge?category=Computer%20Science"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-navbar-text rounded-lg transition-all duration-200"
                >
                  <span className="font-medium text-sm">Computer Science</span>
                </Link>
                <Link
                  to="/knowledge?category=A%2B"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-navbar-text rounded-lg transition-all duration-200"
                >
                  <span className="font-medium text-sm">A+</span>
                </Link>
                <Link
                  to="/knowledge"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-navbar-text rounded-lg transition-all duration-200"
                >
                  <span className="font-medium text-sm">All Articles →</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    Contact
                  </Button>
                </Link>
                <Link to="/track" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold">
                    Track Repair
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
