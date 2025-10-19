"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FaRobot, FaHistory, FaPlus, FaTrash, FaFilePdf } from 'react-icons/fa';
import PDFDownloader from './PDFDownloader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pdfData?: {
    htmlContent: string;
    filename: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface AdminChatbotProps {
  mode?: 'floating' | 'embedded';
}

export default function AdminChatbot({ mode = 'floating' }: AdminChatbotProps) {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load chat history from Supabase on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch('/api/admin/chat-sessions');
        if (response.ok) {
          const sessions = await response.json();
          // Convert messages from JSON string back to objects and parse timestamps
          const historyWithParsedMessages = sessions.map((session: any) => ({
            ...session,
            messages: JSON.parse(session.messages).map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          setChatHistory(historyWithParsedMessages);
        } else {
          console.error('Failed to load chat history');
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const generateSessionTitle = (firstMessage: string): string => {
    // Create a title from the first user message
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  };

  const createNewSession = async () => {
    const newSession: ChatSession = {
      id: '', // Will be set by the database
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: 'Hello! I\'m your admin assistant. Ask me anything about bookings, users, or analytics data. I can also generate PDF reports for you - just ask for a "booking report", "user report", or any custom document you need!',
          timestamp: new Date(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    try {
      const response = await fetch('/api/admin/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newSession.title,
          messages: newSession.messages,
        }),
      });

      if (response.ok) {
        const savedSession = await response.json();
        const sessionWithParsedMessages = {
          ...savedSession,
          messages: JSON.parse(savedSession.messages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        };
        
        setCurrentSession(sessionWithParsedMessages);
        setChatHistory(prev => [sessionWithParsedMessages, ...prev]);
        setShowHistory(false);
      } else {
        console.error('Failed to create new session');
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/chat-sessions?id=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChatHistory(prev => prev.filter(session => session.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setChatHistory(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title, updated_at: new Date().toISOString() }
        : session
    ));
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title, updated_at: new Date().toISOString() } : null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;

    const newMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    
    // Update current session with new message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, newMessage],
      updated_at: new Date().toISOString(),
    };

    // Update title if this is the first user message
    if (currentSession.messages.length === 1) {
      updatedSession.title = generateSessionTitle(input);
    }

    setCurrentSession(updatedSession);
    setInput('');
    setIsTyping(true);

    // Update chat history locally
    setChatHistory(prev => prev.map(session => 
      session.id === currentSession.id ? updatedSession : session
    ));

    // Save to Supabase
    try {
      const response = await fetch('/api/admin/chat-sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentSession.id,
          title: updatedSession.title,
          messages: updatedSession.messages,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save session to database');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }

    try {
      // Check if this is a document request
      const isDocumentRequest = /(generate|create|make|download|get).*(report|document|pdf|file)/i.test(input);
      
      if (isDocumentRequest) {
        // Handle PDF document generation
        await handleDocumentGeneration(input, updatedSession);
      } else {
        // Handle regular chatbot response
        const response = await fetch('/api/admin/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newMessage.content }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        
        const botResponse: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };

        // Update session with bot response
        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, botResponse],
          updatedAt: new Date(),
        };

        setCurrentSession(finalSession);
        setChatHistory(prev => prev.map(session => 
          session.id === currentSession.id ? finalSession : session
        ));

        // Save updated session to Supabase
        try {
          const response = await fetch('/api/admin/chat-sessions', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: currentSession.id,
              title: finalSession.title,
              messages: finalSession.messages,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save session to database');
          }
        } catch (error) {
          console.error('Error saving session:', error);
        }
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updatedAt: new Date(),
      };

      setCurrentSession(finalSession);
      setChatHistory(prev => prev.map(session => 
        session.id === currentSession.id ? finalSession : session
      ));

      // Save updated session to Supabase
      try {
        const response = await fetch('/api/admin/chat-sessions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: currentSession.id,
            title: finalSession.title,
            messages: finalSession.messages,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save session to database');
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleDocumentGeneration = async (userRequest: string, updatedSession: ChatSession) => {
    setIsGeneratingPDF(true);
    
    try {
      // Determine document type based on user request
      let documentType = 'custom';
      let customRequest = userRequest;
      
      if (/booking/i.test(userRequest)) {
        documentType = 'booking_report';
        customRequest = 'Generate a comprehensive booking report';
      } else if (/user|customer|client/i.test(userRequest)) {
        documentType = 'user_report';
        customRequest = 'Generate a comprehensive user report';
      
      }

      const response = await fetch('/api/admin/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          documentType,
          customRequest,
          data: {}
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      
      if (data.success) {
        const botResponse: Message = {
          role: 'assistant',
          content: `${data.message} You can download it using the button below.`,
          timestamp: new Date(),
          pdfData: {
            htmlContent: data.pdfContent,
            filename: data.documentTitle.replace(/\s+/g, '_').toLowerCase()
          }
        };

        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, botResponse],
          updatedAt: new Date(),
        };

        setCurrentSession(finalSession);
        setChatHistory(prev => prev.map(session => 
          session.id === updatedSession.id ? finalSession : session
        ));

        // Save updated session to Supabase
        try {
          const response = await fetch('/api/admin/chat-sessions', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: updatedSession.id,
              title: finalSession.title,
              messages: finalSession.messages,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save session to database');
          }
        } catch (error) {
          console.error('Error saving session:', error);
        }
      } else {
        throw new Error(data.error || 'Failed to generate document');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error generating your document. Please try again.',
        timestamp: new Date(),
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updatedAt: new Date(),
      };

      setCurrentSession(finalSession);
      setChatHistory(prev => prev.map(session => 
        session.id === updatedSession.id ? finalSession : session
      ));

      // Save updated session to Supabase
      try {
        const response = await fetch('/api/admin/chat-sessions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: updatedSession.id,
            title: finalSession.title,
            messages: finalSession.messages,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save session to database');
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // For embedded mode (tab view), render only the chat interface
  if (mode === 'embedded') {
    return (
      <div className="h-full flex flex-col">
        <div className="chatbot-container rounded-lg shadow-lg p-4 bg-white dark:bg-gray-800">
          <div className="chatbot-header flex items-center mb-4">
            <FaRobot className="text-blue-500 mr-2" size={24} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
          <div className="chatbot-messages overflow-y-auto h-64 mb-4">
            {currentSession?.messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role} mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-200'} `}>
                <span>{msg.content}</span>
              </div>
            ))}
            {isTyping && <div className="typing-indicator">Typing...</div>}
          </div>
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
              placeholder="Type your message..."
            />
            <button type="submit" className="bg-blue-500 text-white rounded-lg px-4 py-2">Send</button>
          </form>
        </div>
      </div>
    );
  }

  // For floating mode (original implementation)
  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center z-50",
          "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        )}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Chat header */}
          <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">Admin Assistant</h3>
              {currentSession && (
                <span className="text-xs text-blue-200">
                  {currentSession.title}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-white hover:text-gray-200 focus:outline-none p-1"
                title="Chat History"
              >
                <FaHistory className="h-4 w-4" />
              </button>
              <button
                onClick={createNewSession}
                className="text-white hover:text-gray-200 focus:outline-none p-1"
                title="New Chat"
              >
                <FaPlus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto z-10">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Chat History</div>
                {chatHistory.length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">No previous chats</div>
                ) : (
                  chatHistory.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                        currentSession?.id === session.id && "bg-blue-50 dark:bg-blue-900/30"
                      )}
                    >
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => loadSession(session)}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(new Date(session.updated_at))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Delete chat"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentSession ? (
              currentSession.messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col max-w-[80%] rounded-lg p-3 animate-fade-in",
                    message.role === 'user' 
                      ? "ml-auto bg-blue-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* PDF Download Button */}
                  {message.pdfData && (
                    <div className="mt-3">
                      <PDFDownloader
                        htmlContent={message.pdfData.htmlContent}
                        filename={message.pdfData.filename}
                        onDownloadStart={() => console.log('Starting PDF download...')}
                        onDownloadComplete={() => console.log('PDF download completed')}
                        onError={(error) => console.error('PDF download error:', error)}
                      />
                    </div>
                  )}
                  
                  <span className={cn(
                    "text-xs mt-1",
                    message.role === 'user' ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <FaRobot className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">Start a new chat to begin</p>
                <button
                  onClick={createNewSession}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  New Chat
                </button>
              </div>
            )}
            {isTyping && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%] flex items-center space-x-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            )}
            {isGeneratingPDF && (
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 max-w-[80%] flex items-center space-x-2">
                <FaFilePdf className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-sm text-blue-700 dark:text-blue-300">Generating PDF document...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentSession ? "Ask me anything..." : "Start a new chat..."}
              disabled={isLoading || !currentSession}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || input.trim() === '' || !currentSession}
              className={cn(
                "ml-2 p-2 rounded-lg",
                input.trim() === '' || isLoading || !currentSession
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
} 