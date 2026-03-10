import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, BarChart3, Globe, ShieldCheck, Radio } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para las estadísticas
  const [stats, setStats] = useState({
    users: 0,
    songs: 0,
    videos: 0,
    messages: 0
  });

  // Estados para la configuración global
  const [heroPhrase, setHeroPhrase] = useState('');
  const [heroVideo, setHeroVideo] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    const [usersRes, songsRes, videosRes, msgsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('songs').select('*', { count: 'exact', head: true }),
      supabase.from('videos').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true })
    ]);

    setStats({
      users: usersRes.count || 0,
      songs: songsRes.count || 0,
      videos: videosRes.count || 0,
      messages: msgsRes.count || 0
    });
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) {
      setHeroPhrase(data.hero_phrase || '');
      setHeroVideo(data.hero_video_url || '');
      setLiveStreamUrl(data.live_stream_url || '');
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('settings').upsert({ 
      id: 1, 
      hero_phrase: heroPhrase,
      hero_video_url: heroVideo,
      live_stream_url: liveStreamUrl,
      updated_at: new Date()
    });

    if (error) alert("Error guardando settings: " + error.message);
    else alert("¡Configuración de Sodoma Studio actualizada!");
    
    setSaving(false);
  };

  if (loading) return (
    <div className="p-8 text-emerald-500 animate-pulse font-bold text-center">
      Iniciando sistemas de control...
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <BarChart3 className="text-emerald-500" /> Dashboard & Settings
      </h1>
      
      {/* STATS REALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
          <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-tighter">Fans VIP</h3>
          <p className="text-3xl font-bold text-white">{stats.users}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
          <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-tighter">Canciones</h3>
          <p className="text-3xl font-bold text-white">{stats.songs}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
          <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-tighter">Videos</h3>
          <p className="text-3xl font-bold text-white">{stats.videos}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
          <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-tighter">Mensajes</h3>
          <p className="text-3xl font-bold text-emerald-500">{stats.messages}</p>
        </div>
      </div>

      {/* FORMULARIO DE CONTROL REMOTO */}
      <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-2 mb-8 text-emerald-500">
          <Globe className="w-5 h-5" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Control Global de la Web</h2>
        </div>
        
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CONFIGURACIÓN HOME */}
            <div className="space-y-6">
              <h3 className="text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">Sección Home</h3>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-tighter">Frase Hero</label>
                <input 
                  type="text" 
                  value={heroPhrase}
                  onChange={(e) => setHeroPhrase(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ej. El Código Está Activo" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-tighter">Link Video de Fondo (.mp4)</label>
                <input 
                  type="text" 
                  value={heroVideo}
                  onChange={(e) => setHeroVideo(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="URL directa de Supabase o Drive" 
                />
              </div>
            </div>

            {/* CONFIGURACIÓN LIVE */}
            <div className="space-y-6">
              <h3 className="text-red-500 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Radio className="w-4 h-4 animate-pulse" /> Sección En Vivo
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-tighter">URL de Transmisión (YouTube/Twitch)</label>
                <input 
                  type="text" 
                  value={liveStreamUrl}
                  onChange={(e) => setLiveStreamUrl(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="https://www.youtube.com/watch?v=..." 
                />
                <p className="mt-2 text-[10px] text-gray-500 italic">Pega aquí el link de tu stream para activarlo en la sección Live.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Los cambios se aplican en tiempo real para todos los fans.
            </p>
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 px-10 py-4 bg-emerald-500 text-black font-black uppercase tracking-tighter rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}