import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project } from '../types';
import { Send, Sparkles, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantView() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile && messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: `Namaste ${profile.displayName}! I'm your BuildTrack Site Intelligence agent. As your ${profile.role}, I'm here to support you with technical insights, material tracking, and safety protocols across all active sites. How's the progress today?` 
        }
      ]);
    }
  }, [profile, messages.length]);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const userMessage = textOverride || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const contextData = projects.map(p => ({
        id: p.id,
        name: p.name,
        location: p.location,
        phase: p.phase,
        status: p.status,
        completion: p.completion,
      }));

      const token = await user?.getIdToken();

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          message: userMessage,
          projectData: contextData,
          userProfile: profile
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Assistant Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error connecting to my core intelligence. Please check your connection or try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: `Session cleared. How else can I assist you, ${profile?.displayName || 'Builder'}?` 
    }]);
  };

  const quickPrompts = [
    "What's the status of my sites?",
    "Material shortages?",
    "Draft a daily report",
    "M20 mix ratio?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white border border-stone-200 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="bg-green-900 p-8 flex items-center justify-between border-b-4 border-orange-600">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white font-display leading-none uppercase">Site Intelligence</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400 mt-1">Expert Consultant</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearChat}
              className="p-3 text-white/30 hover:text-red-400 transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-green-900"
              title="Clear Session"
              aria-label="Clear Chat Session"
            >
              <Trash2 className="h-5 w-5" />
            </motion.button>
            <div className="flex items-center gap-2" aria-hidden="true">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Active Link</span>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 bg-stone-50/30 no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110",
                msg.role === 'user' ? "bg-orange-500 text-white" : "bg-green-900 text-white"
              )}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={cn(
                "p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-orange-500 text-white rounded-tr-none" 
                  : "bg-white border border-stone-200 text-green-900 rounded-tl-none markdown-body"
              )}>
                {msg.role === 'assistant' ? (
                  <Markdown>{msg.content}</Markdown>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-stone-400 p-4"
          >
            <div className="h-8 w-8 rounded-xl bg-green-100 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-green-700" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Processing Intelligence...</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 md:p-8 bg-white border-t border-stone-100 flex flex-col gap-4">
        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {quickPrompts.map((prompt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSend(undefined, prompt)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-full transition-colors"
                aria-label={`Ask: ${prompt}`}
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => handleSend(e)} className="relative flex items-center gap-4">
          <input 
            type="text"
            placeholder="Ask about M20 mix, material stock, or site progress..."
            className="w-full h-16 pl-8 pr-20 rounded-2xl bg-stone-50 border-stone-200 focus:bg-white focus:border-green-900 focus:ring-2 focus:ring-green-900/20 text-green-900 font-bold transition-all outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Ask the assistant a question"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 h-10 w-10 flex items-center justify-center bg-green-900 text-white rounded-xl shadow-lg shadow-green-900/20 disabled:opacity-20 transition-all focus:ring-2 focus:ring-green-900 focus:ring-offset-2 outline-none"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </form>
        <p className="mt-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center" aria-live="polite">
          BuildTrack Site AI: Grounded in your project telemetry
        </p>
      </div>
    </div>
  );
}
