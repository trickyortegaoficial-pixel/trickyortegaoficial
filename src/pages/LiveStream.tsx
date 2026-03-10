import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Users, Video, Loader2 } from 'lucide-react';

export default function LiveStream() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    fetchMessages();
    fetchLiveUrl();
    
    const subscription = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
        setMessages(current => [...current, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchLiveUrl = async () => {
    const { data } = await supabase.from('settings').select('live_stream_url').single();
    if (data && data.live_stream_url) {
      // Función para transformar link normal de YouTube a link de Embed
      let url = data.live_stream_url;
      if (url.includes('watch?v=')) {
        url = url.replace('watch?v=', 'embed/');
      } else if (url.includes('youtu.be/')) {
        url = url.replace('youtu.be/', 'youtube.com/embed/');
      } else if (url.includes('youtube.com/live/')) {
         url = url.replace('youtube.com/live/', 'youtube.com/embed/');
      }
      // Añadimos parámetros de autoplay y seguridad
      setLiveUrl(`${url}?autoplay=1&mute=0&modestbranding=1&rel=0`);
    }
    setLoading(false);
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
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

    await supabase.from('chat_messages').insert([
      { user_id: user.id, message: newMessage.trim() }
    ]);
    setNewMessage('');
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-black overflow-hidden">
      {/* Sección de Video */}
      <div className="flex-1 relative bg-zinc-950 border-r border-white/10 overflow-hidden">
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full backdrop-blur-md border border-red-500/30 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-bold tracking-wider uppercase">Live</span>
        </div>
        
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
          <Users className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium tracking-tight uppercase">Sodoma Studio</span>
        </div>

        {/* REPRODUCTOR NATIVO IFRAME */}
        <div className="absolute inset-0 w-full h-full bg-black">
          {liveUrl ? (
            <iframe
              src={liveUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 text-center p-6">
              <Video className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium tracking-widest uppercase opacity-40">Esperando señal activa...</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Chat */}
      <div className="w-full md:w-96 flex flex-col bg-zinc-900/50 backdrop-blur-xl border-l border-white/5">
        <div className="p-4 border-b border-white/10 bg-black/40">
          <h3 className="font-bold text-lg flex items-center gap-2 uppercase tracking-tighter text-white">
            Live Chat <span className="text-emerald-500">.</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-zinc-950/20">
          {messages.map((msg, i) => (
            <div key={i} className="text-sm animate-in slide-in-from-bottom-2 duration-300">
              <span className="font-bold text-emerald-500 mr-2">
                {msg.profiles?.username || 'Fan'}
              </span>
              <span className="text-gray-300 break-words font-light">{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40">
          {user ? (
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-zinc-800 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          ) : (
            <div className="text-center p-4 bg-zinc-800/30 rounded-2xl border border-white/5">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Inicia sesión para participar</p>
              <button 
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-sm font-bold rounded-xl transition-all border border-emerald-500/20"
              >
                Conectar con Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}