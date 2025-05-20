import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FloCatWidgetProps {
  userId: string;
}

const FloCatWidget: React.FC<FloCatWidgetProps> = ({ userId }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: 'Hi there! I\'m FloCat, your productivity assistant. How can I help you today?' }
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to conversation
    const newConversation = [
      ...conversation,
      { role: 'user', content: message }
    ];
    
    setConversation(newConversation);
    setIsLoading(true);
    setMessage('');
    
    try {
      // Simulate a response for now
      setTimeout(() => {
        setConversation([
          ...newConversation,
          { 
            role: 'assistant', 
            content: `I'm here to help you be more productive! How about organizing your tasks for today?` 
          }
        ]);
        setIsLoading(false);
      }, 1000);
      
      // In the actual app, this would call the assistant API
    } catch (error) {
      console.error('Error communicating with FloCat:', error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3">
        <h3 className="text-white font-medium text-sm flex items-center">
          <span className="mr-2">😺</span> FloCat Assistant
        </h3>
      </div>
      
      <div className="p-4 h-64 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {conversation.map((msg, index) => (
            <div 
              key={index}
              className={`${msg.role === 'user' ? 'ml-auto bg-teal-100 text-teal-800' : 'mr-auto bg-gray-100 text-gray-800'} rounded-lg px-3 py-2 max-w-[80%] text-sm`}
            >
              {msg.content}
            </div>
          ))}
          
          {isLoading && (
            <div className="mr-auto bg-gray-100 text-gray-800 rounded-lg px-3 py-2 max-w-[80%] text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="mt-auto">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask FloCat..."
              className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default FloCatWidget;