import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PlantInfo } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatBotProps {
  plantContext?: PlantInfo;
}

export const ChatBot: React.FC<ChatBotProps> = ({ plantContext }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (history.length === 0) {
      const greeting = plantContext 
        ? `Hi! I see you're interested in the ${plantContext.commonName}. What would you like to know about it?`
        : "Hello! I'm your personal gardening expert. Ask me anything about plants, pests, or garden planning!";
      
      setHistory([{ role: 'model', text: greeting, timestamp: Date.now() }]);
    }
  }, [plantContext]); 

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(history, input, plantContext);
      
      const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setHistory(prev => [...prev, modelMsg]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', text: "Sorry, I seem to have lost my connection to the garden. Please try again shortly.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden ring-1 ring-black/5">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-teal-600 p-6 text-white shadow-md z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
            <span className="material-icons-round text-2xl">smart_toy</span>
          </div>
          <div>
            <h2 className="font-bold text-xl leading-tight">Flora Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              <p className="text-green-50 text-xs font-medium opacity-90">Online • Powered by Gemini</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 scrollbar-hide">
        {history.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div 
              className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-sm shadow-primary-200' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-5 bg-white border-t border-gray-100">
        <div className="flex items-end space-x-3 bg-gray-50 rounded-3xl border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-primary-200 focus-within:border-primary-400 transition-all shadow-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 resize-none max-h-32 py-2 px-1 font-medium"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '24px' }}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:scale-105 hover:bg-primary-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="material-icons-round text-xl">send</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wider">AI can make mistakes. Verify important info.</p>
      </div>
    </div>
  );
};