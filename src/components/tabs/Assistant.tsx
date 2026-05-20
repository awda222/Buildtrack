import { useState, useRef, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, Send, Loader2, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Project, Material, Task } from '../../types';
import { useAuth } from '../../App';

export default function Assistant({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Gather project data for context
      const projectRef = doc(db, 'projects', projectId);
      // In a real app we'd fetch materials and tasks too
      const materialsSnap = await getDocs(collection(db, `projects/${projectId}/materials`));
      const tasksSnap = await getDocs(collection(db, `projects/${projectId}/tasks`));
      
      const projectData = {
        materials: materialsSnap.docs.map(d => d.data()),
        tasks: tasksSnap.docs.map(d => d.data()),
      };

      const token = await user?.getIdToken();
      
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userMessage, projectData }),
      });
      
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', text: "Error: " + data.error }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm font-sans">
      {/* Header */}
      <div className="bg-green-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-800 flex items-center justify-center border border-green-700/50">
            <MessageSquare className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-tight text-sm">Site Assistant</h3>
            <div className="flex items-center gap-1.5">
               <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-green-300 text-[10px] font-black uppercase tracking-widest">Active / Online</span>
            </div>
          </div>
        </div>
        <div className="text-green-400/50 font-black text-[10px] uppercase tracking-widest hidden sm:block">
          Smart Builder AI v2.1
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
            <MessageSquare className="h-12 w-12 text-indigo-600" />
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-widest text-xs">Ask me anything about this site</p>
              <p className="text-[10px] uppercase font-bold tracking-tighter">Stock levels • Task updates • Quantity estimates</p>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-4">
               <button onClick={() => setInput("What materials are currently low on stock?")} className="text-[10px] font-bold border border-stone-200 rounded-lg px-3 py-2 hover:bg-white transition-all uppercase tracking-widest text-stone-500">"What materials are low stock?"</button>
               <button onClick={() => setInput("How much cement do I need for M20 mix?")} className="text-[10px] font-bold border border-stone-200 rounded-lg px-3 py-2 hover:bg-white transition-all uppercase tracking-widest text-stone-500">"Estimate cement for M20 mix"</button>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full mb-4",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                  msg.role === 'user' ? "bg-stone-50 border-stone-100 text-stone-400" : "bg-green-800 border-green-900 text-orange-400"
                )}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "rounded-xl px-4 py-3 text-sm shadow-sm border",
                  msg.role === 'user' 
                    ? "bg-green-800 text-white border-green-900 rounded-tr-none" 
                    : "bg-white text-green-900 border-stone-100 rounded-tl-none"
                )}>
                  <div className="prose prose-sm prose-stone max-w-none prose-p:font-medium">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-sm rounded-tl-none">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-50">
        <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-100 focus-within:ring-4 focus-within:ring-green-900/5 transition-all">
          <input
            type="text"
            placeholder="Ask about materials, tasks, or worker wages..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm font-medium text-green-900 placeholder:text-stone-300"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-10 w-10 rounded-lg bg-green-900 text-white flex items-center justify-center hover:bg-green-800 disabled:opacity-50 transition-all shadow-md shadow-green-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
