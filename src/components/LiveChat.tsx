import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Loader2 } from 'lucide-react';

export default function LiveChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('chat_realtime').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
      (payload) => { setMessages((prev) => [...prev, payload.new]); }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(50);
    if (data) setMessages(data);
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    // FIX: Usamos 'message' (columna real) y 'user_id'
    const { error } = await supabase.from('chat_messages').insert([{ 
      user_id: user.id, 
      message: newMessage.trim() 
    }]);
    
    if (error) console.error("Error en envío:", error.message);
    else setNewMessage('');
  };

  if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" /></div>;

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="text-emerald-500 font-bold mr-2 uppercase text-[10px]">
              {msg.user_id === user.id ? 'ADMIN' : 'FAN'}
            </span>
            <span className="text-gray-300 font-light">{msg.message}</span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Escribir..." />
        <button type="submit" className="p-2 bg-emerald-500 text-black rounded-full hover:bg-emerald-400 active:scale-90 transition-all"><Send size={18} /></button>
      </form>
    </div>
  );
}