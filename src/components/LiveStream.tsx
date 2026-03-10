import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Users, Video, Loader2 } from 'lucide-react';

export default function LiveStream({ adminUser }: { adminUser?: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(adminUser || null);
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adminUser) checkUser();
    fetchMessages();
    fetchLiveUrl();
    
    const subscription = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      }, payload => {
        setMessages(current => [...current, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [adminUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchLiveUrl = async () => {
    try {
      const { data } = await supabase.from('settings').select('live_stream_url').single();
      if (data?.live_stream_url) {
        let url = data.live_stream_url;
        if (url.includes('watch?v=')) url = url.replace('watch?v=', 'embed/');
        else if (url.includes('youtu.be/')) url = url.replace('youtu.be/', 'youtube.com/embed/');
        else if (url.includes('youtube.com/live/')) url = url.replace('youtube.com/live/', 'youtube.com/embed/');
        setLiveUrl(`${url}?autoplay=1&mute=0&modestbranding=1&rel=0`);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUser(session.user);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setMessages(data.reverse());
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    await supabase.from('chat_messages').insert([{ user_id: user.id, message: newMessage.trim() }]);
    setNewMessage('');
  };

  if (loading) return <div className="h-full flex items-center justify-center bg-black"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="h-full flex flex-col md:flex-row bg-black overflow-hidden">
      {/* SECCIÓN DE VIDEO: Solo se muestra si NO somos Admin (para no duplicar) */}
      {!adminUser && (
        <div className="flex-1 relative bg-zinc-950 border-r border-white/10">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full backdrop-blur-md border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold tracking-wider uppercase">Live</span>
          </div>
          <div className="absolute inset-0 w-full h-full bg-black">
            {liveUrl ? (
              <iframe src={liveUrl} className="w-full h-full border-0" allowFullScreen></iframe>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600"><Video className="w-16 h-16 mb-4 opacity-20" /></div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN DE CHAT: Siempre se muestra */}
      <div className={`${adminUser ? 'w-full' : 'w-full md:w-96'} flex flex-col bg-zinc-900/50 backdrop-blur-xl border-l border-white/5`}>
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2 uppercase tracking-tighter text-white">
            Chat <span className="text-emerald-500">.</span>
          </h3>
          {adminUser && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black">MODO ADMIN</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/20">
          {messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="font-bold text-emerald-500 mr-2 uppercase tracking-tighter">
                {msg.profiles?.username || (msg.user_id === adminUser?.id ? 'SODOMA ADMIN' : 'Fan')}
              </span>
              <span className="text-gray-300 break-words font-light">{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40">
          {user ? (
            <form onSubmit={sendMessage} className="flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-zinc-800 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
              <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-emerald-500 text-black rounded-full flex items-center justify-center active:scale-90 transition-transform"><Send className="w-4 h-4" /></button>
            </form>
          ) : (
            <p className="text-center text-xs text-zinc-600 uppercase tracking-widest">Inicia sesión</p>
          )}
        </div>
      </div>
    </div>
  );
}