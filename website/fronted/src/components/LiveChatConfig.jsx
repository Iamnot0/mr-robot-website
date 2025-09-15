import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  MessageCircle, 
  X, 
  Send, 
  Phone, 
  Mail,
  Clock,
  User,
  Bot,
  Minimize2,
  Maximize2,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
// Inline chat config to avoid import issues
const CHAT_CONFIG = {
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  MODEL: 'gpt-4o',
  MAX_TOKENS: 200,
  TEMPERATURE: 0.7,
  COMPANY_INFO: {
    name: 'MR-ROBOT Computer Repair',
    services: [
      'Hardware repair and replacement',
      'Software issues and troubleshooting',
      'Virus removal and security',
      'Data recovery services',
      'System upgrades and optimization',
      'Keyboard and battery replacement',
      'Software installation and configuration'
    ],
    features: [
      'Free diagnostics',
      'Competitive pricing',
      'Emergency repair services',
      'Residential and business customers',
      'Professional technical support'
    ]
  },
  SYSTEM_PROMPT: `You are a friendly and professional customer service representative for MR-ROBOT Computer Repair. We provide "computer repair with a smile!"

IMPORTANT IDENTITY RESPONSE:
- If someone asks "who are you" or "what are you", respond EXACTLY: "I'm the Assistance using AI Power on behalf of Mr Robot himself"

Company Information:
- We provide comprehensive computer repair services including hardware repair, software issues, virus removal, data recovery, and system upgrades
- We offer emergency repair services for urgent issues
- Our services include screen repair, keyboard replacement, battery replacement, software installation, and system optimization
- We provide FREE diagnostics for all services
- We serve both residential and business customers
- Our motto: "Computer repair with a smile!"

Contact Information:
- Phone: 09790525598
- Email: mr.robotcomputerservice@gmail.com
- Only provide contact details when customers specifically need to reach us directly or for booking

Our Services:
- Hardware repair and upgrades
- Software installation and troubleshooting
- Virus removal and system optimization
- Data recovery and backup services
- Network setup and configuration
- Cybersecurity assessments
- Operating system installation and upgrades
- Web design and development services

Technical Troubleshooting Guidelines:
- For slow laptop/computer issues: Suggest checking startup programs, clearing temporary files, running disk cleanup, checking for malware, and considering RAM upgrade
- For virus/malware issues: Recommend running antivirus scan, booting in safe mode, using malware removal tools
- For software problems: Suggest restarting the application, checking for updates, reinstalling if necessary
- For hardware issues: Recommend checking connections, updating drivers, running hardware diagnostics
- For network problems: Suggest checking router, restarting network adapter, checking firewall settings
- Always provide step-by-step technical guidance before suggesting professional service
- Only suggest contacting us directly if the issue is complex or requires professional intervention

Guidelines:
- Be helpful, professional, and friendly with a warm, approachable tone
- Use the phrase "computer repair with a smile!" when appropriate
- Provide smart technical suggestions and troubleshooting steps FIRST
- Only provide contact information when customers need to book services or for complex issues
- If you don't know something specific, offer to connect them with our technical team
- Keep responses concise but informative (under 200 words)
- Always offer to help with booking a service or getting a quote
- Use a professional but approachable tone
- Do NOT mention specific prices or free diagnostics
- Direct customers to contact us for pricing information
- Focus on solving their computer problems with smart technical guidance
- Maintain a warm and friendly tone without using emojis
- NEVER give incorrect pricing information as it damages our business
- Always verify pricing against our actual service database`,
  QUICK_ACTIONS: [
    { label: "Book Service", action: "I'd like to book a computer repair service" },
    { label: "Urgent", action: "I have an urgent computer issue that needs immediate attention" },
    { label: "Rating", action: "I'd like to rate your services or leave feedback" }
  ],
  FALLBACK_MESSAGES: [
    "I apologize, but I'm having trouble connecting to our AI system right now. Please try again in a moment, or contact our support team directly.",
    "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team directly.",
    "I'm experiencing technical difficulties. Please try again in a moment or contact our support team for immediate assistance."
  ]
};

const getChatConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    ...CHAT_CONFIG,
    DEBUG_MODE: isDevelopment,
    API_TIMEOUT: isDevelopment ? 10000 : 5000
  };
};

const LiveChatConfig = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to MR-ROBOT Computer Repair. what your computer needs today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isAIConnected, setIsAIConnected] = useState(false);
  const [aiError, setAiError] = useState(null);
  const messagesEndRef = useRef(null);

  // Get configuration
  const config = getChatConfig();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test AI connection on component mount
  useEffect(() => {
    testAIConnection();
  }, []);

  const testAIConnection = async () => {
    try {
      const response = await fetch(config.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: config.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for MR-ROBOT Computer Repair. Respond briefly to confirm connection.'
            },
            {
              role: 'user',
              content: 'Hello, are you working?'
            }
          ],
          max_tokens: 50,
          temperature: config.TEMPERATURE
        })
      });

      if (response.ok) {
        setIsAIConnected(true);
        setAiError(null);
      } else {
        setIsAIConnected(false);
        setAiError('AI connection failed');
      }
    } catch (error) {
      setIsAIConnected(false);
      setAiError('AI connection error');
    }
  };

  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch(config.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: config.MODEL,
          messages: [
            {
              role: 'system',
              content: config.SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: config.MAX_TOKENS,
          temperature: config.TEMPERATURE
        })
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI Response Error:', error);
      // Fallback to smart responses if AI fails
      return getSmartFallbackResponse(userMessage);
    }
  };

  const getSmartFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Identity questions
    if (message.includes('who are you') || message.includes('what are you')) {
      return "I'm the Assistance using AI Power on behalf of Mr Robot himself";
    }
    
    // Slow computer/laptop issues
    if (message.includes('slow') || message.includes('lag') || message.includes('performance')) {
      return "For a slow laptop, try these steps:\n\n1. Check startup programs - disable unnecessary ones\n2. Clear temporary files and run disk cleanup\n3. Check for malware with antivirus scan\n4. Consider upgrading RAM if possible\n5. Close unused browser tabs and applications\n\nIf these steps don't help, we can provide professional optimization service. Contact us at 09790525598 for assistance.";
    }
    
    // Virus/malware issues
    if (message.includes('virus') || message.includes('malware') || message.includes('infected')) {
      return "For virus/malware issues:\n\n1. Run a full antivirus scan\n2. Boot in safe mode and scan again\n3. Use malware removal tools like Malwarebytes\n4. Update your antivirus software\n5. Avoid suspicious downloads and emails\n\nIf the problem persists, we offer virus removal service. Contact us at 09790525598 for assistance.";
    }
    
    // Software problems
    if (message.includes('software') || message.includes('program') || message.includes('application')) {
      return "For software issues:\n\n1. Restart the application\n2. Check for software updates\n3. Restart your computer\n4. Reinstall the software if necessary\n5. Check if other programs are working\n\nIf you need help with software installation, we offer this service. Contact us at 09790525598 for assistance.";
    }
    
    // Hardware issues
    if (message.includes('hardware') || message.includes('broken') || message.includes('not working')) {
      return "For hardware issues:\n\n1. Check all connections and cables\n2. Update device drivers\n3. Run hardware diagnostics\n4. Check device manager for errors\n5. Test with different cables if possible\n\nFor complex hardware repairs, we offer professional service. Contact us at 09790525598 for assistance.";
    }
    
    // Network problems
    if (message.includes('internet') || message.includes('network') || message.includes('wifi')) {
      return "For network issues:\n\n1. Restart your router and modem\n2. Check network adapter settings\n3. Update network drivers\n4. Check firewall settings\n5. Try connecting with ethernet cable\n\nIf network problems persist, we can help with diagnostics. Contact us at 09790525598 for assistance.";
    }
    
    // Service booking responses
    if (message.includes('book') || message.includes('service') || message.includes('repair')) {
      return "I'd be happy to help you book a computer repair service! We offer comprehensive repair services including hardware repair, software issues, virus removal, and data recovery. Please contact us directly at 09790525598 or mr.robotcomputerservice@gmail.com to schedule your service.";
    }
    
    // Pricing inquiries
    if (message.includes('price') || message.includes('cost') || message.includes('quote')) {
      return "For pricing information and detailed quotes, please contact us directly at 09790525598 or mr.robotcomputerservice@gmail.com. We provide competitive pricing for all our computer repair services.";
    }
    
    // Emergency/urgent requests
    if (message.includes('urgent') || message.includes('emergency') || message.includes('immediate')) {
      return "I understand you have an urgent computer issue! For immediate assistance, please call us directly at 09790525598. We offer emergency repair services and will do our best to help you as quickly as possible.";
    }
    
    // General help
    if (message.includes('help') || message.includes('problem') || message.includes('issue')) {
      return "I'm here to help with your computer problems! We specialize in hardware repair, software issues, virus removal, data recovery, and system upgrades. For immediate assistance, please call 09790525598 or email mr.robotcomputerservice@gmail.com.";
    }
    
    // Contact information requests
    if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return "You can reach us at:\n\n📞 Phone: 09790525598\n📧 Email: mr.robotcomputerservice@gmail.com\n\nWe're here to help with all your computer repair needs!";
    }
    
    // Default helpful response
    return "Thank you for contacting MR-ROBOT Computer Repair! I'm here to help with your computer needs. For immediate assistance, please call us at 09790525598 or email mr.robotcomputerservice@gmail.com. We provide competitive pricing for all our services!";
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(newMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const fallbackResponse = getSmartFallbackResponse(newMessage);
      const botMessage = {
        id: Date.now() + 1,
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = config.QUICK_ACTIONS;

  const handleQuickAction = (action) => {
    setNewMessage(action);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-secondary text-primary-foreground rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
        title="Open AI-Powered Live Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 z-50 w-80 shadow-2xl transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-96'
    }`}>
      <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo (copy 1).png" 
                  alt="MR-ROBOT Logo" 
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <CheckCircle className={`h-4 w-4 ${isOnline ? 'text-green-400' : 'text-gray-400'}`} />
                <CardTitle className="text-sm font-medium">Chat</CardTitle>
              </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-80">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 text-primary" />
                    )}
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    className="text-xs h-6 px-2"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm min-h-[40px] max-h-[100px] resize-none"
                disabled={!isOnline}
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isOnline}
                size="sm"
                className="bg-primary hover:bg-secondary self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {!isOnline && (
              <p className="text-xs text-gray-500 mt-2">
                Our support team is currently offline. Leave a message and we'll get back to you!
              </p>
            )}
            <p className="text-xs text-primary mt-2 text-center">
              computer repair with a smile!
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LiveChatConfig;
