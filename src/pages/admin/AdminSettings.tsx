import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, BarChart3, Globe, ShieldCheck, Radio, Instagram, Youtube, Music, Facebook, Share2 } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [stats, setStats] = useState({
    users: 0,
    songs: 0,
    videos: 0,
    messages: 0
  });

  const [heroPhrase, setHeroPhrase] = useState('');
  const [heroVideo, setHeroVideo] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  
  // NUEVO: Estado para redes sociales
  const [socials, setSocials] = useState({
    instagram: '',
    youtube: '',
    spotify: '',
    facebook: '',
    tiktok: ''
  });

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
      // Cargamos las redes
      setSocials({
        instagram: data.instagram_url || '',
        youtube: data.youtube_url || '',
        spotify: data.spotify_url || '',
        facebook: data.facebook_url || '',
        tiktok: data.tiktok_url || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('settings').upsert({ 
      id: 1, 
      hero_phrase: heroPhrase,
      hero_video_url: heroVideo,
      live_stream_url: liveStreamUrl,
      instagram_url: socials.instagram,
      youtube_url: socials.youtube,
      spotify_url: socials.spotify,
      facebook_url: socials.facebook,
      tiktok_url: socials.tiktok,
      updated_at: new Date()
    });

    if (error) alert("Error guardando settings: " + error.message);
    else alert("¡Ecosistema Sodoma Studio actualizado! 🦾🔥");
    
    setSaving(false);
  };

  if (loading) return (
    <div className="p-8 text-emerald-500 animate-pulse font-bold text-center uppercase tracking-widest">
      Sincronizando Centro de Control...
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <h1 className="text-4xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
        <BarChart3 className="text-emerald-500" /> Dashboard General
      </h1>
      
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Fans VIP', value: stats.users },
          { label: 'Canciones', value: stats.songs },
          { label: 'Videos', value: stats.videos },
          { label: 'Mensajes', value: stats.messages, highlight: true },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900 p-6 rounded-3xl border border-white/5 shadow-xl">
            <h3 className="text-gray-500 text-[10px] font-black mb-1 uppercase tracking-widest">{s.label}</h3>
            <p className={cn("text-4xl font-black", s.highlight ? "text-emerald-500" : "text-white")}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FORMULARIO DE CONTROL */}
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMNA 1: CONTENIDO WEB */}
          <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 space-y-8">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <Globe className="w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">Configuración Visual</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Frase de Impacto (Hero)</label>
                <input 
                  type="text" 
                  value={heroPhrase}
                  onChange={(e) => setHeroPhrase(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white focus:border-emerald-500 outline-none transition-all font-light"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Fondo de Pantalla (Video URL)</label>
                <input 
                  type="text" 
                  value={heroVideo}
                  onChange={(e) => setHeroVideo(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-red-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <Radio className="w-3 h-3 animate-pulse" /> Link Transmisión en Vivo
                </label>
                <input 
                  type="text" 
                  value={liveStreamUrl}
                  onChange={(e) => setLiveStreamUrl(e.target.value)}
                  className="w-full bg-black border border-red-500/20 rounded-xl px-4 py-4 text-white focus:border-red-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* COLUMNA 2: REDES SOCIALES */}
          <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 space-y-8">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <Share2 className="w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">Canales Oficiales</h2>
            </div>

            <div className="space-y-5">
              {[
                { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-500' },
                { id: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-600' },
                { id: 'spotify', icon: Music, label: 'Spotify', color: 'text-emerald-500' },
                { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
              ].map((social) => (
                <div key={social.id} className="relative">
                  <social.icon className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", social.color)} />
                  <input 
                    type="text"
                    value={socials[social.id]}
                    onChange={(e) => setSocials({...socials, [social.id]: e.target.value})}
                    placeholder={`Enlace de ${social.label}`}
                    className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-gray-300 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BOTÓN DE GUARDADO FLOTANTE O FIJO */}
        <div className="sticky bottom-8 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center justify-between shadow-2xl z-50">
          <p className="text-[10px] text-gray-500 flex items-center gap-2 uppercase font-bold tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sistema de Control Sodoma Studio v2.0
          </p>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-3 px-12 py-4 bg-emerald-500 text-black font-black uppercase tracking-tighter rounded-2xl hover:bg-white transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Publicar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// Función auxiliar para clases rápidas
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}