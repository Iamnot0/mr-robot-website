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
                  <path d="M19.077 4.928c-2.082-2.083-4.922-3.134-7.904-2.894C7.164 2.356 3.65 5.144 2.474 8.99c-1.97 6.44 2.983 13.557 10.06 14.459 3.73.475 7.68-.699 10.139-3.158C25.66 17.304 22.065 7.917 19.077 4.928zm-8.706 12.85c-.948 0-1.896-.181-2.771-.544l-3.065.804.82-2.952c-.395-.906-.607-1.88-.607-2.878 0-4.337 3.53-7.867 7.867-7.867s7.867 3.53 7.867 7.867-3.53 7.867-7.867 7.867zm4.329-5.732c-.181-.272-.663-.435-.905-.543-.242-.108-.694-.326-.935-.217-.241.109-.387.435-.543.597-.156.162-.326.217-.597.163-.271-.054-.597-.217-.869-.326-.271-.109-.652-.326-.869-.543-.217-.217-.326-.489-.435-.706-.109-.217-.163-.489-.163-.706 0-.435.272-.76.543-.978.271-.217.597-.326.869-.326.271 0 .543.109.76.326.217.217.326.489.326.76z"/>
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
