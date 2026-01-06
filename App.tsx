import React, { useState, useRef, useEffect } from 'react';
import { Menu, Send, X, RefreshCw } from 'lucide-react';
import { Message, MessageRole } from './types';
import { chatManager } from './services/geminiService';
import { MessageBubble } from './components/MessageBubble';
import { Sidebar } from './components/Sidebar';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: MessageRole.MODEL,
      content: "Hello! I'm InspectorAI. I can help you access inspection history, find reports, or search for specific defects in the database. What equipment are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Add placeholder loading message
    const loadingMsgId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
      id: loadingMsgId,
      role: MessageRole.MODEL,
      content: '',
      timestamp: new Date(),
      isThinking: true
    }]);

    setIsLoading(true);

    try {
      const responseText = await chatManager.sendMessage(userText);
      
      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsgId 
          ? { ...msg, content: responseText, isThinking: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsgId 
          ? { ...msg, content: "Sorry, I encountered an error connecting to the database.", isThinking: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSelect = (eqId: string, eqName: string) => {
    setInputValue(`Show me the inspection history for ${eqName}`);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar onSelectEquipment={handleQuickSelect} isOpen={isSidebarOpen} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Inspection Assistant</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium">System Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Reset Chat"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide bg-slate-50">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about equipment, defects, or reports..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none bg-slate-100 border border-slate-300 rounded-xl py-3.5 pl-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm disabled:opacity-50"
              style={{ minHeight: '52px', maxHeight: '150px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
              AI can make mistakes. Verify critical inspection data in original reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;