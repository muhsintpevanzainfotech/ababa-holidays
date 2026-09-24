import React, { useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIPanel = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Design protocol initiated. I am ready to architect your next-gen interface. What is the mission?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg = { role: 'bot', content: 'Architecting a premium travel booking hub with high-fidelity glass components...' };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full px-6 pb-6">
      <div className="flex items-center justify-between py-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-violet-500 flex items-center gap-2">
          <Sparkles size={16} /> Neural Architect
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                m.role === 'user' 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' 
                : 'bg-white border border-slate-100 text-slate-600 shadow-sm'
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 pl-2">
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Command the AI..."
          className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-14 text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all outline-none"
        />
        <button 
          onClick={handleSend}
          className="absolute right-2 top-2 w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIPanel;
