import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User as UserIcon } from 'lucide-react';

export default function LiveChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // SUSCRIPCIÓN EN TIEMPO REAL
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(50);
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('chat_messages').insert([{
      content: newMessage,
      user_id: user.id,
      username: user.email.split('@')[0] // Nombre temporal basado en su correo
    }]);

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Chat en Vivo</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <span className="text-[10px] text-emerald-500 font-bold mb-1 ml-1">{msg.username}</span>
            <div className="bg-black/40 p-3 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%]">
              <p className="text-sm text-gray-300">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
          placeholder="Escribe algo..."
        />
        <button type="submit" className="p-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-600 transition-all">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}