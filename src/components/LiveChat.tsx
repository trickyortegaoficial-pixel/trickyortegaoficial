import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Loader2, Trash2, ShieldCheck } from 'lucide-react';

export default function LiveChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ACCESO MAESTRO
  const ADMIN_EMAIL = "trickyortegaoficial@gmail.com"; 

  useEffect(() => {
    fetchMessages();

    const channel = supabase.channel('chat_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_messages' }, 
        (payload) => { 
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new]); 
          } else if (payload.eventType === 'DELETE') {
            setMessages([]);
          }
        }
      ).subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    const { error } = await supabase.from('chat_messages').insert([{ 
      user_id: user.id, 
      message: newMessage.trim() 
    }]);
    
    if (!error) setNewMessage('');
  };

  const handleClearChat = async () => {
    if (!window.confirm("¿Confirmas la purga total del chat de Sodoma Studio? 🦾")) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .not('id', 'is', null); 

      if (error) throw error;
      setMessages([]);
    } catch (error: any) {
      alert("Error en la purga: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-zinc-950 rounded-3xl border border-white/5 flex flex-col items-center justify-center h-full">
        <Loader2 className="animate-spin text-emerald-500 mb-4" />
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Sincronizando Feed...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* HEADER */}
      <div className="p-4 bg-black/60 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/20" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sodoma Live Chat</h2>
        </div>

        {user?.email === ADMIN_EMAIL && (
          <button 
            onClick={handleClearChat}
            className="flex items-center gap-2 p-2 px-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 group"
          >
            <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Limpiar Chat</span>
          </button>
        )}
      </div>

      {/* BODY MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-gradient-to-b from-transparent to-black/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 gap-2 py-10">
            <ShieldCheck size={24} className="text-gray-500" />
            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black text-center">Canal Purgado</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
              <span className="text-emerald-500 font-black mr-2 uppercase text-[9px] tracking-widest italic opacity-80">
                {msg.user_id === user.id ? 'ADMIN' : 'FAN'}
              </span>
              <span className="text-gray-300 font-light leading-relaxed">{msg.message}</span>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-4 bg-black/80 border-t border-white/5">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800" 
            placeholder="Escribir mensaje..." 
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-emerald-500 text-black rounded-2xl hover:bg-emerald-400 active:scale-90 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

    </div>
  );
}