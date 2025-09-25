import { useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowUp, Home, Mail, ChevronRight } from 'lucide-react';

type Message = {
  type: 'bot' | 'user';
  text: string;
  feedback: string | null;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [screen, setScreen] = useState<'intro' | 'chat'>('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [botBusy, setBotBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [userId] = useState(() => {
    const existing = sessionStorage?.getItem("user_id");
    if (existing) return existing;
    const random = `user_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage?.setItem("user_id", random);
    return random;
  });

  // Enhanced mobile detection and viewport handling
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 390, height: 610 });
  const [isIOS, setIsIOS] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent || navigator.vendor;
      
      setIsMobile(width <= 768);
      setWindowSize({ width, height });
      setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
      setViewportHeight(window.visualViewport?.height || height);
    };
    
    checkDevice();
    
    // Listen for viewport changes (important for mobile keyboards)
    const handleResize = () => checkDevice();
    const handleViewportChange = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage?.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    const savedMessages = sessionStorage?.getItem(`chat_messages_${userId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [userId]);

  const helpOptions = [
    "How much does a kitchen renovation cost in Montreal?",
    "What's included in your free consultation?",
    "How long does a bathroom renovation take?",
    "Do you handle permits and inspections?",
    "Can I see examples of your recent projects?"
  ];

  useEffect(() => {
    if (isOpen) {
      const nameStored = sessionStorage?.getItem("chat_name");
      const emailStored = sessionStorage?.getItem("chat_email");
      if (nameStored && emailStored) {
        setScreen("chat");
      } else {
        setScreen("intro");
      }
    }
  }, [isOpen]);

  const handleBotResponse = async (userMessage: string) => {
    setBotBusy(true);
    setTypingMessage("Adam is typing...");

    try {
      // Simulating API response with variable delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      const mockResponses = [
        "Thank you for your message! Our renovation specialists will get back to you within the hour.",
        "Great question! We'd love to discuss your project in detail. Let me connect you with our team.",
        "I can help you with that! Our kitchen renovations typically range from $15,000 to $50,000 depending on size and finishes.",
        "Our free consultation includes a site visit, measurements, and a detailed estimate. No obligations!",
        "Bathroom renovations usually take 2-3 weeks, depending on complexity and permits required."
      ];
      
      const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setTypingMessage(null);
      setMessages(prev => [...prev, { type: 'bot', text: mockResponse, feedback: null }]);

    } catch {
      setTypingMessage(null);
      setMessages(prev => [...prev, { type: 'bot', text: "Oops! Something went wrong. Please try again.", feedback: null }]);
    }

    setBotBusy(false);
    setMessageQueue(prev => {
      const [nextMessage, ...rest] = prev;
      if (nextMessage) {
        setTimeout(() => {
          handleBotResponse(nextMessage);
        }, 500);
      }
      return rest;
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const message = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: message, feedback: null }]);

    // Blur input on mobile to hide keyboard
    if (isMobile && inputRef.current) {
      inputRef.current.blur();
    }

    if (botBusy) {
      setMessageQueue(prev => [...prev, message]);
    } else {
      await handleBotResponse(message);
    }
  };

  const handleHelpClick = (prompt: string) => {
    setScreen("chat");
    handleBotResponse(prompt);
  };

  const [firstMessageSent, setFirstMessageSent] = useState(() => {
    return sessionStorage?.getItem("first_message_sent") === "true";
  });

  const handleDirectMessage = () => {
    setScreen("chat");

    if (firstMessageSent) return;

    const storedName = sessionStorage?.getItem("chat_name");
    const storedEmail = sessionStorage?.getItem("chat_email");

    if (!storedName || !storedEmail) {
      handleBotResponse("Hello, I'd like to start a conversation about your renovation services.");
    }

    setFirstMessageSent(true);
    sessionStorage?.setItem("first_message_sent", "true");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  // Responsive dimensions
  const getResponsiveDimensions = () => {
    if (isMobile) {
      return {
        width: '100vw',
        height: '100vh',
        maxHeight: '100vh'
      };
    }
    return {
      width: '390px',
      height: '610px',
      maxHeight: '610px'
    };
  };

  // Responsive font sizes
  const getFontSizes = () => {
    const baseSize = isMobile ? (windowSize.width < 375 ? 14 : 16) : 16;
    return {
      header: isMobile ? Math.max(14, baseSize - 2) : 15,
      message: isMobile ? Math.max(13, baseSize - 3) : 14,
      input: isMobile ? 16 : 14, // 16px prevents zoom on iOS
      button: isMobile ? Math.max(11, baseSize - 5) : 12,
      help: isMobile ? Math.max(12, baseSize - 4) : 13
    };
  };

  const dimensions = getResponsiveDimensions();
  const fonts = getFontSizes();

  return (
    <>
      {/* CSS Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .mobile-chatbot {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            z-index: 999999 !important;
          }

          .mobile-scroll {
            -webkit-overflow-scrolling: touch;
            overflow-y: auto;
            height: 100%;
          }

          .mobile-input {
            font-size: 16px !important;
            -webkit-appearance: none;
            border-radius: 20px;
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e0 transparent;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e0;
            border-radius: 3px;
          }

          .message-enter {
            animation: messageSlide 0.3s ease-out forwards;
          }

          @keyframes messageSlide {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .typing-dots {
            display: inline-flex;
            align-items: center;
            gap: 2px;
          }

          .typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #999;
            animation: typingBounce 1.4s infinite ease-in-out both;
          }

          .typing-dot:nth-child(1) { animation-delay: -0.32s; }
          .typing-dot:nth-child(2) { animation-delay: -0.16s; }
          .typing-dot:nth-child(3) { animation-delay: 0s; }

          @keyframes typingBounce {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .hover-scale {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .hover-scale:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .hover-scale:active {
            transform: translateY(0);
          }

          @media screen and (max-width: 768px) {
            .mobile-chatbot * {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `
      }} />

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={isMobile ? 'mobile-chatbot' : ''}
          style={{
            position: 'fixed',
            bottom: isMobile ? '0' : '20px',
            right: isMobile ? '0' : '20px',
            left: isMobile ? '0' : 'auto',
            top: isMobile ? '0' : 'auto',
            zIndex: 10000,
            ...dimensions
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? '0' : '20px',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: isMobile ? 'none' : '0 10px 40px rgba(0,0,0,0.15)',
            border: isMobile ? 'none' : '1px solid #e9ecef'
          }}>
            
            {/* Enhanced Header */}
            <div style={{
              background: 'linear-gradient(135deg, #000000, #7a7a7a)',
              padding: isMobile ? '15px' : '20px',
              paddingTop: isMobile ? '30px' : '20px',
              color: 'white',
              minHeight: isMobile ? 'auto' : '100px',
              flexShrink: 0
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: isMobile ? '10px' : '15px' 
              }}>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '25px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  KASSELWOOD FABRICATORS
                </div>
              </div>
              
              {screen === 'intro' && (
                <div style={{
                  fontSize: fonts.header,
                  lineHeight: 1.4,
                  opacity: 0.95
                }}>
                  <span style={{ fontSize: isMobile ? '18px' : '20px', marginRight: '8px' }}>👋</span>
                  Hi, I'm <strong>Adam</strong> from Kasselwood Fabricators. How can I help you today?
                </div>
              )}

              {screen === 'chat' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    A
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: fonts.header }}>Adam</div>
                    <div style={{ fontSize: fonts.help, opacity: 0.8 }}>
                      {botBusy ? 'Typing...' : 'Online now'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f8f9fa',
              overflow: 'hidden'
            }}>
              
              {/* Intro Screen */}
              {screen === 'intro' && (
                <div style={{
                  flex: 1,
                  padding: isMobile ? '15px' : '20px',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch'
                }} className="custom-scrollbar mobile-scroll">
                  
                  {/* Quick Message Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleHelpClick("I'd like to send you a message")}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: isMobile ? '16px' : '20px',
                      marginBottom: '15px',
                      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e9ecef',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    className="hover-scale"
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: fonts.message, 
                        fontWeight: '600', 
                        color: '#000',
                        marginBottom: '4px'
                      }}>
                        💬 Send us a message
                      </div>
                      <div style={{ 
                        fontSize: fonts.help, 
                        color: '#666' 
                      }}>
                        We typically reply within an hour
                      </div>
                    </div>
                    <ChevronRight 
                      color="#666" 
                      size={isMobile ? 16 : 18} 
                      style={{ flexShrink: 0, marginLeft: '10px' }}
                    />
                  </motion.div>

                  {/* Help Options */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      padding: isMobile ? '12px 16px' : '15px 20px',
                      borderBottom: '1px solid #e9ecef',
                      backgroundColor: 'rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ 
                        fontSize: fonts.message, 
                        fontWeight: '600', 
                        color: '#000' 
                      }}>
                        ❓ Popular Questions
                      </div>
                    </div>
                    
                    {helpOptions.map((option, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleHelpClick(option)}
                        style={{
                          padding: isMobile ? '14px 16px' : '16px 20px',
                          borderBottom: idx < helpOptions.length - 1 ? '1px solid #e9ecef' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          minHeight: isMobile ? '60px' : '65px'
                        }}
                      >
                        <div style={{ 
                          fontSize: fonts.help, 
                          color: '#000',
                          lineHeight: 1.4,
                          flex: 1,
                          paddingRight: '10px'
                        }}>
                          {option}
                        </div>
                        <ChevronRight 
                          color="#666" 
                          size={14} 
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Screen */}
              {screen === 'chat' && (
                <>
                  {/* Messages Area */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    padding: isMobile ? '10px 15px' : '15px 20px',
                    paddingBottom: '20px'
                  }} className="custom-scrollbar mobile-scroll">
                    
                    {/* Welcome message for empty chat */}
                    {messages.length === 0 && !typingMessage && (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#666'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
                        <div style={{ fontSize: fonts.message, marginBottom: '5px' }}>Start a conversation</div>
                        <div style={{ fontSize: fonts.help }}>Ask me anything about renovations!</div>
                      </div>
                    )}

                    {/* Message Stack */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            display: 'flex',
                            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end',
                            gap: '8px'
                          }}
                        >
                          {/* Bot Avatar */}
                          {msg.type === 'bot' && (
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #000000, #7a7a7a)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>
                              A
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div style={{
                            maxWidth: isMobile ? '75%' : '70%',
                            padding: isMobile ? '12px 16px' : '14px 18px',
                            borderRadius: msg.type === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                            backgroundColor: msg.type === 'user' 
                              ? '#000' 
                              : 'white',
                            color: msg.type === 'user' ? 'white' : '#000',
                            fontSize: fonts.message,
                            lineHeight: 1.4,
                            boxShadow: msg.type === 'bot' ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none',
                            border: msg.type === 'bot' ? '1px solid #e9ecef' : 'none',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {typingMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '8px'
                          }}
                        >
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #000000, #7a7a7a)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            A
                          </div>
                          <div style={{
                            padding: '14px 18px',
                            borderRadius: '20px 20px 20px 6px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e9ecef',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ 
                              fontSize: fonts.help, 
                              color: '#666' 
                            }}>
                              Adam is typing
                            </span>
                            <div className="typing-dots">
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Fixed Input Area */}
                  <div style={{
                    flexShrink: 0,
                    padding: isMobile ? '15px' : '20px',
                    paddingBottom: isMobile ? '25px' : '20px',
                    backgroundColor: 'white',
                    borderTop: '1px solid #e9ecef',
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-end'
                    }}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        disabled={botBusy}
                        className={isMobile ? 'mobile-input' : ''}
                        style={{
                          flex: 1,
                          padding: isMobile ? '14px 18px' : '12px 16px',
                          borderRadius: '25px',
                          border: '2px solid #e9ecef',
                          outline: 'none',
                          fontSize: fonts.input,
                          backgroundColor: '#f8f9fa',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                          resize: 'none',
                          minHeight: isMobile ? '48px' : '44px',
                          maxHeight: '120px',
                          opacity: botBusy ? 0.6 : 1,
                          ...(input.length > 0 ? {
                            borderColor: '#000',
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                          } : {})
                        }}
                      />
                      
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={botBusy || !input.trim()}
                        style={{
                          width: isMobile ? '48px' : '44px',
                          height: isMobile ? '48px' : '44px',
                          borderRadius: '50%',
                          border: 'none',
                          background: (input.trim() && !botBusy) 
                            ? 'linear-gradient(135deg, #000000, #7a7a7a)' 
                            : '#ccc',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: (input.trim() && !botBusy) ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                          boxShadow: (input.trim() && !botBusy) 
                            ? '0 2px 8px rgba(0,0,0,0.2)' 
                            : 'none'
                        }}
                      >
                        <ArrowUp size={isMobile ? 20 : 18} />
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Footer Navigation */}
            <div style={{
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-around',
              padding: isMobile ? '12px 0' : '15px 0',
              paddingBottom: isMobile ? '20px' : '15px',
              backgroundColor: 'white',
              borderTop: '1px solid #e9ecef',
              boxShadow: screen === 'intro' ? '0 -2px 10px rgba(0,0,0,0.1)' : 'none'
            }}>
              {[
                { icon: Home, label: 'Home', screenName: 'intro' },
                { icon: Mail, label: 'Chat', screenName: 'chat' },
              ].map((item, idx) => {
                const Icon = item.icon;
                const isActive = screen === item.screenName;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (item.screenName === 'chat') {
                        handleDirectMessage();
                      } else {
                        setScreen(item.screenName);
                      }
                    }}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: isActive ? '#000' : '#666',
                      padding: isMobile ? '8px 15px' : '5px 10px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '60px'
                    }}
                  >
                    <Icon size={isMobile ? 20 : 22} style={{ transition: 'color 0.3s ease' }} />
                    <div style={{ fontSize: fonts.button, marginTop: '2px', fontWeight: isActive ? '600' : '400' }}>{item.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Chatbot;