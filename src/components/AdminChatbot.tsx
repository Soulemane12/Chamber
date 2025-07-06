"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FaRobot } from 'react-icons/fa';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AdminChatbotProps {
  mode?: 'floating' | 'embedded';
}

export default function AdminChatbot({ mode = 'floating' }: AdminChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your admin assistant. Ask me anything about bookings, users, or analytics data.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
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

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            {messages.map((msg, index) => (
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
            <h3 className="font-medium">Admin Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
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
                <span className={cn(
                  "text-xs mt-1",
                  message.role === 'user' ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                )}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%] flex items-center space-x-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
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
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || input.trim() === ''}
              className={cn(
                "ml-2 p-2 rounded-lg",
                input.trim() === '' || isLoading 
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