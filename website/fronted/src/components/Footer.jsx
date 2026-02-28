import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook,
  Linkedin,
  Send,
  ChevronUp
} from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-footer-bg text-footer-text">
      {/* Upper Section - Logo, Company Name, and Navigation Links */}
      <div className="border-b border-footer-text/20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-4">
              <img 
                src="/logo (copy 1).png"
                alt="MR-ROBOT Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.target.src = '/logo.png';
                }}
              />
              <div>
                <h3 className="text-2xl font-bold text-footer-text">MR-ROBOT</h3>
                <p className="text-footer-text/80 text-sm">Computer Repair with a Smile!</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
              <Link to="/services" className="text-footer-text hover:text-footer-hover transition-colors font-medium">
                Services
              </Link>
              <Link to="/knowledge" className="text-footer-text hover:text-footer-hover transition-colors font-medium">
                Knowledge
              </Link>
              <Link to="/contact" className="text-footer-text hover:text-footer-hover transition-colors font-medium">
                Contact
              </Link>
              <Link to="/track" className="text-footer-text hover:text-footer-hover transition-colors font-medium">
                Track Repair
              </Link>
              <Link to="/about" className="text-footer-text hover:text-footer-hover transition-colors font-medium">
                About
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section - Social Media, Legal Links, and Scroll to Top */}
      <div className="py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Social Media Section */}
            <div className="flex items-center space-x-6">
              <span className="text-footer-text font-medium">FOLLOW US</span>
              <div className="flex items-center space-x-4">
                <a 
                  href="https://www.facebook.com/MrRobotComputerRepairWithASmile" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-footer-text hover:text-footer-hover transition-colors"
                  aria-label="Visit our Facebook Page"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://medium.com/@mrrobot.computerservice" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-footer-text hover:text-footer-hover transition-colors"
                  aria-label="Read our Medium Articles"
                >
                  <svg 
                    className="h-5 w-5" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/mrcl%C3%A0y/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-footer-text hover:text-footer-hover transition-colors"
                  aria-label="Connect on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="https://invite.viber.com/?g2=AQAvlCMVg%2BOHw1VFcWR9MWgMKO2j2xa8s0NKd2ml6T8g2yUGzdOCQ1HkRlq%2FBqcS" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-footer-text hover:text-footer-hover transition-colors"
                  aria-label="Join our Viber Channel"
                >
                  <svg 
                    className="h-5 w-5" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </a>
                <a 
                  href="https://t.me/MrRobot_ComputerService" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-footer-text hover:text-footer-hover transition-colors"
                  aria-label="Join our Telegram Channel"
                >
                  <Send className="h-5 w-5" />
                </a>
                <a 
                  href="mailto:mrrobot.computerservice@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-footer-text hover:text-footer-hover transition-colors"
                  aria-label="Send us an Email"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
              <Link to="/privacy" className="text-footer-text hover:text-footer-hover transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-footer-text hover:text-footer-hover transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/accessibility" className="text-footer-text hover:text-footer-hover transition-colors text-sm">
                Accessibility
              </Link>
              <span className="text-footer-text/80 text-sm">
                © 2025 MR-ROBOT. All rights reserved.
              </span>
            </div>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="flex items-center justify-center w-10 h-10 bg-footer-text/10 hover:bg-footer-text/20 rounded-full transition-colors"
              aria-label="Scroll to top"
            >
              <ChevronUp className="h-5 w-5 text-footer-text" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
