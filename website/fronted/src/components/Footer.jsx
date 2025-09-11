import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Send
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-mr-charcoal text-mr-white">
      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo (copy 1).png"
                  alt="MR-ROBOT Logo"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.src = '/logo2.png';
                  }}
                />
                <div>
                  <h3 className="text-xl font-bold text-mr-white">MR-ROBOT</h3>
                  <p className="text-mr-blue-light text-sm">Computer Repair with a Smile !</p>
                </div>
              </div>
              <p className="text-mr-blue-light text-sm leading-relaxed">
                Professional computer repair, cybersecurity solutions, and technical support. 
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-mr-white">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/services" className="block text-mr-blue-light transition-colors">
                  Services
                </Link>
                <Link to="/knowledge" className="block text-mr-blue-light transition-colors">
                  Knowledge
                </Link>
                <Link to="/contact" className="block text-mr-blue-light transition-colors">
                  Contact
                </Link>
                <Link to="/login" className="block text-mr-blue-light transition-colors">
                  Client Portal
                </Link>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-mr-white">Services</h4>
              <div className="space-y-2">
                <div className="text-mr-blue-light text-sm">Hardware Repair</div>
                <div className="text-mr-blue-light text-sm">Software Solutions</div>
                <div className="text-mr-blue-light text-sm">Cybersecurity</div>
                <div className="text-mr-blue-light text-sm">Network Setup</div>
                <div className="text-mr-blue-light text-sm">Data Recovery</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-mr-white">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-mr-cerulean mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-mr-white text-sm font-medium">Location</div>
                    <div className="text-mr-blue-light text-sm">16°47'31.1"N 96°07'36.2"E</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-mr-cerulean mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-mr-white text-sm font-medium">Phone</div>
                    <div className="text-mr-blue-light text-sm">+95 9790525598</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-mr-cerulean mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-mr-white text-sm font-medium">Email</div>
                    <div className="text-mr-blue-light text-sm">mr.robotcomputerservice@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-mr-cerulean mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-mr-white text-sm font-medium">Hours</div>
                    <div className="text-mr-blue-light text-sm">Mon-Sat: 9AM-6PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-mr-charcoal-light">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-mr-blue-light text-sm">
              © 2024 MR-ROBOT Computer Repair with a Smile !. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a 
                href="https://www.facebook.com/MrRobotComputerRepairWithASmile" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-mr-blue-light hover:text-mr-cerulean transition-colors"
                aria-label="Visit our Facebook Page"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://medium.com/@mrrobot.computerservice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-mr-blue-light hover:text-mr-cerulean transition-colors"
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
                className="text-mr-blue-light hover:text-mr-cerulean transition-colors"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://invite.viber.com/?g2=AQAvlCMVg%2BOHw1VFcWR9MWgMKO2j2xa8s0NKd2ml6T8g2yUGzdOCQ1HkRlq%2FBqcS" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-mr-blue-light hover:text-mr-cerulean transition-colors"
                aria-label="Join our Viber Channel"
              >
                <svg 
                  className="h-5 w-5" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm.01 1.67c4.38 0 7.95 3.57 7.95 7.95s-3.57 7.95-7.95 7.95c-1.51 0-2.91-.42-4.11-1.15l-.47-.24-2.52.66.67-2.42-.26-.5c-.8-1.24-1.26-2.71-1.26-4.3 0-4.38 3.57-7.95 7.95-7.95z"/>
                  <path d="M8.53 7.33c.16 0 .3.06.43.18.14.14.35.43.56.87.22.45.37.85.4.92.06.14.06.3-.04.48-.1.18-.15.29-.3.45-.15.16-.31.36-.44.48-.15.15-.31.31-.13.61.18.3.82 1.27 1.75 2.05 1.2.99 2.21 1.3 2.52 1.45.31.15.48.12.66-.07.18-.2.77-.87.98-1.17.21-.31.42-.26.7-.15.29.1 1.83.86 2.14 1.01.31.16.52.24.59.37.08.14.08.79-.18 1.56-.27.77-1.56 1.49-2.14 1.57-.58.09-1.31.04-2.17-.32-.56-.23-1.28-.57-2.17-1.22-1.87-1.37-3.09-3.13-3.19-3.27-.1-.14-.81-1.06-.81-2.02 0-.96.51-1.43.69-1.62.18-.2.4-.25.53-.25z"/>
                </svg>
              </a>
              <a 
                href="https://t.me/MrRobot_ComputerService" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-mr-blue-light hover:text-mr-cerulean transition-colors"
                aria-label="Join our Telegram Channel"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
