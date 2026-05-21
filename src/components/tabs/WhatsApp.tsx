import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Send, Loader2, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../App';

export default function WhatsApp({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !message) return;

    setLoading(true);
    setStatus(null);

    try {
      const idToken = user?.uid === 'local-guest-123' ? 'demo-token' : await user?.getIdToken();
      const res = await fetch('/api/whatsapp/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ to: phone, message })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp message');
      }

      setStatus({ type: 'success', text: `Message sent successfully! SID: ${data.sid}` });
      setMessage('');
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] p-8 border border-stone-200">
        <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6">
          <div className="h-14 w-14 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-green-900 leading-none">WhatsApp Integration</h3>
            <p className="text-stone-500 font-medium tracking-wide mt-1 text-sm">Send daily progress reports & alerts directly to workers.</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-5 max-w-2xl">
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${
                status.type === 'success' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-red-50 text-red-600'
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              {status.text}
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Recipient Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 font-medium text-green-900 transition-all outline-none"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-2 ml-1 font-medium tracking-wide">Include country code (e.g., +91 for India). Use Twilio Sandbox numbers for testing.</p>
          </div>

          <div>
            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Message</label>
            <textarea
              rows={4}
              placeholder="Enter your message or daily report..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 font-medium text-green-900 transition-all outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !phone || !message}
            className="flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold tracking-wide shadow-lg shadow-[#25D366]/20 hover:bg-[#1DA851] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span>{loading ? 'Sending...' : 'Send WhatsApp Message'}</span>
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] p-8 border border-stone-200">
        <h4 className="font-black text-green-900 uppercase tracking-tight mb-4 text-lg">Chatbot Instructions</h4>
        <div className="prose prose-sm text-stone-600 max-w-none">
          <p>The BuildTrack bot can automatically handle incoming messages from your workforce:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>"report" or "progress"</strong>: The bot retrieves daily progress and sends a status report.</li>
            <li><strong>"issue [desc]" or "delay [desc]"</strong>: Automatically logs a site alert/delay issue in the system.</li>
            <li><strong>"done [task]" or "completed"</strong>: Updates the system and marks a task as resolved.</li>
          </ul>
          <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm">
            <p className="font-bold mb-1">Configuration Needed</p>
            <p>Ensure your <code>TWILIO_ACCOUNT_SID</code> and <code>TWILIO_AUTH_TOKEN</code> are set in the platform's Environment Variables. Then, configure your Twilio Sandbox Webhook URL to point to: <code>YOUR_APP_URL/api/whatsapp/webhook</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
