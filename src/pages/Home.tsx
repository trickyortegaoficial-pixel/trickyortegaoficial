import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [settings, setSettings] = useState({
    hero_phrase: 'Explorando nuevos sonidos y creando experiencias inolvidables.',
    hero_video_url: 'https://cdn.coverr.co/videos/coverr-dj-playing-music-in-a-club-5244/1080p.mp4'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (data && !error) {
        setSettings({
          hero_phrase: data.hero_phrase,
          hero_video_url: data.hero_video_url
        });
      }
    } catch (err) {
      console.error("Error cargando settings de la Home:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video Dinámico */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video
          key={settings.hero_video_url} // El key ayuda a React a recargar el video si cambia la URL
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src={settings.hero_video_url}
        />
      </div>

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase mb-6"
        >
          TRICKY <span className="text-emerald-500">ORTEGA</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light"
        >
          {settings.hero_phrase}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/music" 
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 group"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Escuchar Música
          </Link>
          <Link 
            to="/history" 
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-full transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Ver Historia
          </Link>
        </motion.div>
      </div>
    </div>
  );
}