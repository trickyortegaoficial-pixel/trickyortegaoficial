import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Loader2, Trash2, ShieldCheck } from 'lucide-react';

export default function LiveChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // TU ACCESO MAESTRO
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

    return () => { supabase.removeChannel(channel); };
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
      console.error("Error cargando mensajes:", error);
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

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .neq('id', 0); 

    if (error) alert("Error en la purga: " + error.message);
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-zinc-950 rounded-3xl border border-white/5">
        <Loader2 className="animate-spin text-emerald-500 mx-auto" />
        <p className="text-[10px] text-gray-500 uppercase mt-4 tracking-widest font-black">Iniciando Enlace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* HEADER */}
      <div className="p-4 bg-black/60 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 gap-2">
            <ShieldCheck size={24} className="text-gray-500" />
            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black">Canal Purgado</p>
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
      <form onSubmit={sendMessage} className="p-4 bg-black/80 border-t border-white/5 flex gap-3">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-700" 
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
  );
}