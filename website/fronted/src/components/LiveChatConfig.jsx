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
import { getChatConfig } from '../config/chatConfig';

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
    // Check if API key is available
    if (!config.OPENAI_API_KEY || config.OPENAI_API_KEY === '') {
      return getSmartFallbackResponse(userMessage);
    }

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
      return getSmartFallbackResponse(userMessage);
    }
  };

  const getSmartFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Service booking responses
    if (message.includes('book') || message.includes('service') || message.includes('repair')) {
      return "I'd be happy to help you book a computer repair service! We offer comprehensive repair services including hardware repair, software issues, virus removal, and data recovery. Please contact us directly at 09790525598 or mr.robotcomputerservice@gmail.com to schedule your service. We provide FREE diagnostics for all services!";
    }
    
    // Pricing inquiries
    if (message.includes('price') || message.includes('cost') || message.includes('quote')) {
      return "Here are our current service prices in MMK:\n\n• General Troubleshooting: 20,000 MMK\n• Software Installation: 10,000 MMK\n• Virus Removal: 8.33 MMK\n• OS Installation: 20,000 MMK\n• Hardware Upgrades: 15,000 MMK\n• Data Recovery: 30,000 MMK\n\nAll services include FREE diagnostics! Contact us at 09790525598 for a detailed quote.";
    }
    
    // Emergency/urgent requests
    if (message.includes('urgent') || message.includes('emergency') || message.includes('immediate')) {
      return "I understand you have an urgent computer issue! For immediate assistance, please call us directly at 09790525598. We offer emergency repair services and will do our best to help you as quickly as possible.";
    }
    
    // General help
    if (message.includes('help') || message.includes('problem') || message.includes('issue')) {
      return "I'm here to help with your computer problems! We specialize in hardware repair, software issues, virus removal, data recovery, and system upgrades. For immediate assistance, please call 09790525598 or email mr.robotcomputerservice@gmail.com. We provide FREE diagnostics for all services!";
    }
    
    // Contact information requests
    if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return "You can reach us at:\n\n📞 Phone: 09790525598\n📧 Email: mr.robotcomputerservice@gmail.com\n\nWe're here to help with all your computer repair needs!";
    }
    
    // Default helpful response
    return "Thank you for contacting MR-ROBOT Computer Repair! I'm here to help with your computer needs. For immediate assistance, please call us at 09790525598 or email mr.robotcomputerservice@gmail.com. We provide FREE diagnostics and competitive pricing for all our services!";
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
        className="fixed bottom-6 right-6 z-50 bg-mr-cerulean hover:bg-mr-cerulean-dark text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
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
      <CardHeader className="bg-mr-cerulean text-white p-4 rounded-t-lg">
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
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-6 w-6 p-0"
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
                      ? 'bg-mr-cerulean text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 text-mr-cerulean" />
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
                    <Bot className="h-4 w-4 text-mr-cerulean" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                className="bg-mr-cerulean hover:bg-mr-cerulean-dark self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {!isOnline && (
              <p className="text-xs text-gray-500 mt-2">
                Our support team is currently offline. Leave a message and we'll get back to you!
              </p>
            )}
            <p className="text-xs text-mr-cerulean mt-2 text-center">
              computer repair with a smile!
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LiveChatConfig;
