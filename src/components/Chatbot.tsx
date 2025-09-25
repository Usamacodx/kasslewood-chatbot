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

  const [userId] = useState(() => {
    const existing = sessionStorage?.getItem("user_id");
    if (existing) return existing;
    const random = `user_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage?.setItem("user_id", random);
    return random;
  });

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 390, height: 610 });

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width <= 768);
      setWindowSize({ width, height });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      // Simulating API response for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResponse = "Thank you for your message! This is a demo response. Our team will get back to you shortly with more information about our renovation services.";
      
      setTypingMessage(null);
      setMessages(prev => [...prev, { type: 'bot', text: mockResponse, feedback: null }]);

    } catch {
      setTypingMessage(null);
      setMessages(prev => [...prev, { type: 'bot', text: "Oops! Something went wrong.", feedback: null }]);
    }

    setBotBusy(false);
    setMessageQueue(prev => {
      const [nextMessage, ...rest] = prev;
      if (nextMessage) {
        setTimeout(() => {
          handleBotResponse(nextMessage);
        }, 2000);
      }
      return rest;
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const message = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: message, feedback: null }]);

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
      handleBotResponse("Hello, I'd like to start a conversation.");
    }

    setFirstMessageSent(true);
    sessionStorage?.setItem("first_message_sent", "true");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            bottom: isMobile ? '0px' : '0px',
            right: isMobile ? '0px' : '0px',
            left: isMobile ? '0px' : 'auto',
            zIndex: 10000,
            width: isMobile ? '100vw' : 'auto',
            height: isMobile ? '100vh' : 'auto',
          }}
        >
          <div style={{
            width: isMobile ? '100%' : '390px',
            height: isMobile ? '100vh' : '610px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? "0px" : "30px",
            overflow: "hidden",
            backgroundColor: 'white',
            boxShadow: isMobile ? 'none' : '0 10px 25px rgba(0,0,0,0.2)',
            maxWidth: isMobile ? 'none' : '390px'
          }}>
            
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #000000, #7a7a7a)",
              padding: isMobile ? '20px 15px' : '20px',
              paddingTop: isMobile ? "max(40px, env(safe-area-inset-top, 20px))" : "20px",
              color: 'white',
              minHeight: isMobile ? "120px" : "100px"
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: isMobile ? "200px" : "250px",
                  height: isMobile ? "40px" : "50px",
                  marginTop: isMobile ? "10px" : "20px",
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '14px' : '16px',
                  color: 'black',
                  fontWeight: 'bold',
                  marginRight: "10px"
                }}>
                  KASSELWOOD FABRICATORS
                </div>
              </div>
              
              {screen === 'intro' && (
                <p style={{ 
                  margin: 0, 
                  fontSize: isMobile ? 14 : 15, 
                  paddingTop: '20px', 
                  paddingRight: isMobile ? '20px' : '50px',
                  lineHeight: '1.4'
                }}>
                  👋 Hi, I'm the chatbot from <b>KASSELWOOD FABRICATORS</b>. How can I help you today?
                </p>
              )}
            </div>

            {/* Main Body */}
            <div style={{
              overflowY: 'auto',
              flex: 1,
              padding: isMobile ? '8px' : '10px',
              backgroundColor: '#f8f9fa'
            }}>
              {screen === 'intro' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: isMobile ? '10px' : '15px'
                  }}
                >
                  {/* Send a message card */}
                  <div
                    style={{
                      background: 'white',
                      borderRadius: '10px',
                      padding: isMobile ? '12px' : '15px',
                      marginBottom: '12px',
                      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleHelpClick("Send us a message")}
                  >
                    <div>
                      <strong style={{ fontSize: isMobile ? '14px' : '15px', color: '#000' }}>Send us a message</strong>
                      <p style={{ margin: 0, fontSize: isMobile ? '12px' : '13px', color: '#666' }}>We typically reply within an hour</p>
                    </div>
                    <ChevronRight color="#000000" size={isMobile ? 14 : 16} />
                  </div>

                  {/* Help options card */}
                  <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: isMobile ? '8px 10px' : '10px 15px',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
                  }}>
                    {helpOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: isMobile ? '12px 10px' : '14px 15px',
                          borderBottom: idx < helpOptions.length - 1 ? '1px solid #eee' : 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleHelpClick(opt)}
                      >
                        <span style={{ color: '#000', fontSize: isMobile ? '13px' : '14px' }}>{opt}</span>
                        <ChevronRight color="#ccc" size={isMobile ? 12 : 14} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {screen === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '10px' }}>
                    {messages.map((msg, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                        <div style={{
                          maxWidth: isMobile ? '85%' : '75%',
                          padding: isMobile ? '12px' : '13px 13px 14px 13px',
                          borderRadius: '20px',
                          color: msg.type === 'user' ? 'white' : 'black',
                          background: msg.type === 'user' ? 'linear-gradient(135deg, #000000, #7a7a7a)' : '#f1f1f1',
                          fontSize: isMobile ? "13px" : "14px",
                          lineHeight: isMobile ? "1.4" : "1.5"
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {typingMessage && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{
                          width: isMobile ? '24px' : '28px',
                          height: isMobile ? '24px' : '28px',
                          marginRight: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'black',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: isMobile ? '10px' : '12px'
                        }}>
                          AI
                        </div>
                        <div style={{
                          background: '#f1f1f1',
                          borderRadius: '20px',
                          padding: '10px 15px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: isMobile ? '12px' : '13px' }}>Adam is typing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    display: 'flex',
                    padding: isMobile ? '12px 8px' : '8px',
                    boxShadow: "0 -4px 10px -4px #dfdfdf8a",
                    background: '#fff',
                    paddingBottom: isMobile ? 'max(20px, env(safe-area-inset-bottom, 8px))' : '8px'
                  }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: isMobile ? '12px 15px' : '10px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        fontSize: isMobile ? '16px' : '14px'
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      style={{
                        marginLeft: '8px',
                        borderRadius: '50%',
                        background: "linear-gradient(135deg, #000000, #7a7a7a)",
                        width: isMobile ? '45px' : '40px',
                        border: "none",
                        height: isMobile ? '45px' : '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowUp color="white" size={isMobile ? 18 : 20} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: isMobile ? '15px 0' : '10px 0',
              paddingBottom: isMobile ? 'max(25px, env(safe-area-inset-bottom, 10px))' : '10px',
              borderTop: '1px solid #ddd',
              background: '#f8f9fa',
              fontFamily: "'Segoe UI', sans-serif",
              fontWeight: 500,
              boxShadow: (screen === 'intro') ? "0 5px 10px #b3b3b3" : "none"
            }}>
              {[
                { icon: Home, label: 'Home', screenName: 'intro' },
                { icon: Mail, label: 'Messages', screenName: 'chat' },
              ].map((item, idx) => {
                const Icon = item.icon;
                const isActive = screen === item.screenName;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: isActive ? '#000000' : '#555',
                      padding: isMobile ? '8px 15px' : '5px 10px',
                      borderRadius: '8px'
                    }}
                    onClick={() => {
                      if (item.screenName === 'chat') {
                        handleDirectMessage();
                      } else if (item.screenName) {
                        setScreen(item.screenName);
                      }
                    }}
                  >
                    <Icon size={isMobile ? 20 : 22} style={{ transition: 'color 0.3s ease' }} />
                    <div style={{ fontSize: isMobile ? 11 : 12, marginTop: 2 }}>{item.label}</div>
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