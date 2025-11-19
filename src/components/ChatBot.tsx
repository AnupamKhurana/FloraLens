import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PlantInfo, AILanguageModel } from '../types';
import { sendChatMessage, checkLocalAICapability, createLocalSession } from '../services/geminiService';

interface ChatBotProps {
  plantContext?: PlantInfo;
  isOnline: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({ plantContext, isOnline }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocalAI, setIsLocalAI] = useState(false);
  const [localSession, setLocalSession] = useState<AILanguageModel | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize Chat & Check capabilities
  useEffect(() => {
    const initChat = async () => {
      // 1. Check Local AI capability
      const localAvailable = await checkLocalAICapability();
      setIsLocalAI(localAvailable);

      if (localAvailable && !localSession) {
        try {
          const session = await createLocalSession(plantContext);
          setLocalSession(session);
        } catch (err) {
          console.error("Failed to init local session", err);
          setIsLocalAI(false);
        }
      }

      // 2. Set initial greeting if empty
      if (history.length === 0) {
        const greeting = plantContext 
          ? `Hi! I see you're interested in the ${plantContext.commonName}. What would you like to know about it?`
          : "Hello! I'm your personal gardening expert. Ask me anything about plants, pests, or garden planning!";
        
        setHistory([{ role: 'model', text: greeting, timestamp: Date.now() }]);
      }
    };

    initChat();

    // Cleanup local session on unmount
    return () => {
      if (localSession) {
        localSession.destroy();
      }
    };
  }, [plantContext]); // Re-run if plant context changes

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Safety check for offline
    if (!isOnline && !isLocalAI) {
        return;
    }

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = "";

      if (isLocalAI && localSession) {
        // Use Edge AI (Works Offline)
        try {
           responseText = await localSession.prompt(input);
        } catch (e) {
          // Fallback if local session crashes/fails
          if (isOnline) {
             console.warn("Local AI failed, falling back to cloud", e);
             responseText = await sendChatMessage(history, input, plantContext);
          } else {
             responseText = "I'm having trouble processing that offline. Please reconnect to the internet.";
          }
        }
      } else if (isOnline) {
        // Use Cloud AI (Requires Internet)
        responseText = await sendChatMessage(history, input, plantContext);
      } else {
         responseText = "I cannot connect to the cloud right now. Please check your internet connection.";
      }
      
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

  const isInputDisabled = isLoading || (!isOnline && !isLocalAI);

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden ring-1 ring-black/5">
      
      {/* Header */}
      <div className={`p-6 text-white shadow-md z-10 relative overflow-hidden bg-gradient-to-r ${!isOnline ? 'from-gray-600 to-gray-500' : 'from-primary-600 to-teal-600'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <span className="material-icons-round text-2xl">smart_toy</span>
            </div>
            <div>
              <h2 className="font-bold text-xl leading-tight">Flora Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                    !isOnline 
                        ? (isLocalAI ? 'bg-yellow-400 animate-pulse' : 'bg-red-400') 
                        : (isLocalAI ? 'bg-yellow-300 animate-pulse' : 'bg-green-300 animate-pulse')
                }`}></span>
                <p className="text-green-50 text-xs font-medium opacity-90">
                  {!isOnline 
                    ? (isLocalAI ? 'Offline Mode (Available)' : 'Offline')
                    : (isLocalAI ? 'On-Device AI' : 'Cloud Connected')
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Badge for AI Type */}
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/20 ${
              isLocalAI 
                ? 'bg-yellow-400/20 text-yellow-50' 
                : (!isOnline ? 'bg-gray-400/20 text-gray-200' : 'bg-white/20 text-white')
          }`}>
             {isLocalAI ? '⚡ Edge Model' : (!isOnline ? '🚫 Offline' : '☁️ Gemini Pro')}
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
        <div className={`flex items-end space-x-3 bg-gray-50 rounded-3xl border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-primary-200 focus-within:border-primary-400 transition-all shadow-inner ${isInputDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
                !isOnline && !isLocalAI 
                    ? "Connect to internet to chat..." 
                    : (isLocalAI ? "Ask quickly (On-Device)..." : "Ask a question...")
            }
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 resize-none max-h-32 py-2 px-1 font-medium disabled:cursor-not-allowed"
            rows={1}
            disabled={isInputDisabled}
            style={{ minHeight: '24px' }}
          />
          <button 
            onClick={handleSend}
            disabled={isInputDisabled || !input.trim()}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isInputDisabled 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:scale-105 hover:bg-primary-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="material-icons-round text-xl">send</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wider">
          {!isOnline && !isLocalAI 
            ? 'Offline: Chat Unavailable' 
            : (isLocalAI ? '⚡ Running locally on Gemini Nano' : 'AI can make mistakes. Verify important info.')}
        </p>
      </div>
    </div>
  );
};