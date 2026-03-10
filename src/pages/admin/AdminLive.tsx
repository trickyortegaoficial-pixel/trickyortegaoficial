import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Radio, Layout, MessageSquare, Video } from 'lucide-react';
import LiveChat from '../../components/LiveChat';

export default function AdminLive() {
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Obtener la URL del directo desde Supabase
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('live_stream_url') 
        .single();
      
      if (settingsError) console.error("Error al traer settings:", settingsError);

      if (settings?.live_stream_url) {
        let url = settings.live_stream_url;
        
        if (typeof url === 'string') {
          // Transformación a formato Embed de YouTube
          if (url.includes('watch?v=')) {
            url = url.replace('watch?v=', 'embed/');
          } else if (url.includes('youtu.be/')) {
            url = url.replace('youtu.be/', 'youtube.com/embed/');
          } else if (url.includes('youtube.com/live/')) {
            url = url.replace('youtube.com/live/', 'youtube.com/embed/');
          }
          setLiveUrl(`${url}?autoplay=1&mute=1&modestbranding=1&rel=0`);
        }
      }

      // 2. CONFIGURACIÓN DEL ADMIN PARA EL CHAT
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Creamos un objeto de usuario estandarizado para que el LiveChat no muestre sombras
        setUser({
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            // Forzamos el nombre de la marca para el chat
            full_name: session.user.user_metadata?.full_name || "SODOMA STUDIO",
            avatar_url: session.user.user_metadata?.avatar_url || "" 
          }
        });
      }
    } catch (err) {
      console.error("Falla crítica en el renderizado:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-emerald-500 animate-pulse font-bold text-center h-screen flex items-center justify-center bg-black">
      Cargando Panel de Sodoma...
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500 p-4 lg:p-0">
      
      {/* HEADER DE CONTROL */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white uppercase tracking-tighter">
          <Radio className="text-red-500 animate-pulse" /> Monitor Admin
        </h1>
        <div className="px-4 py-1 bg-zinc-800 border border-white/5 rounded-full text-zinc-400 text-[10px] font-black uppercase tracking-widest">
          Sodoma Control Room
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        
        {/* MONITOR DE VIDEO (LADO IZQUIERDO) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl min-h-[400px] flex items-center justify-center">
            {liveUrl ? (
              <iframe
                src={liveUrl}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-center p-10 bg-zinc-950 w-full h-full flex flex-col items-center justify-center">
                <Video className="w-12 h-12 mb-4 text-emerald-500/20" />
                <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Sin señal configurada</p>
                <p className="text-[10px] text-zinc-600 mt-2 italic">Dato en Supabase: NULL</p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT EN VIVO (LADO DERECHO) */}
        <div className="lg:col-span-1 flex flex-col h-full min-h-[400px]">
          <div className="flex-1 bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0">
              {/* Solo renderizamos el chat si el usuario está listo */}
              {user ? (
                <LiveChat user={user} />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                  Esperando sesión de Administrador...
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div> 
  );
}