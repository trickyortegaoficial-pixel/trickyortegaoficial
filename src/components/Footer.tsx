import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Music, Facebook, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [socials, setSocials] = useState(null);

  useEffect(() => {
    const fetchSocials = async () => {
      // Forzamos la búsqueda de la fila 1 para que coincida con el Admin
      const { data } = await supabase
        .from('settings')
        .select('instagram_url, youtube_url, spotify_url, facebook_url, tiktok_url')
        .eq('id', 1)
        .single();

      if (data) {
        setSocials(data);
      }
    };
    fetchSocials();
  }, []);

  return (
    <footer className="bg-black border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* BRANDING */}
          <div className="text-center md:text-left">
            <Link to="/" className="text-3xl font-black tracking-tighter text-white uppercase italic">
              TRICKY ORTEGA<span className="text-emerald-500">.</span>
            </Link>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">
              Sodoma Studio &copy; {new Date().getFullYear()} • Arquitecto de Realidades
            </p>
          </div>
          
          {/* ICONOS VISIBLES */}
          <div className="flex items-center gap-8">
            {socials?.instagram_url && (
              <a href={socials.instagram_url} target="_blank" rel="noreferrer" 
                 className="text-gray-400 hover:text-pink-500 transition-all transform hover:scale-125">
                <Instagram size={24} />
              </a>
            )}
            
            {socials?.youtube_url && (
              <a href={socials.youtube_url} target="_blank" rel="noreferrer" 
                 className="text-gray-400 hover:text-red-600 transition-all transform hover:scale-125">
                <Youtube size={24} />
              </a>
            )}
            
            {socials?.spotify_url && (
              <a href={socials.spotify_url} target="_blank" rel="noreferrer" 
                 className="text-gray-400 hover:text-emerald-500 transition-all transform hover:scale-125">
                <Music size={24} />
              </a>
            )}

            {socials?.facebook_url && (
              <a href={socials.facebook_url} target="_blank" rel="noreferrer" 
                 className="text-gray-400 hover:text-blue-500 transition-all transform hover:scale-125">
                <Facebook size={24} />
              </a>
            )}

            {/* Si no hay nada configurado, mostramos un icono de compartir discreto */}
            {!socials?.instagram_url && !socials?.youtube_url && !socials?.spotify_url && (
              <p className="text-zinc-800 text-xs uppercase tracking-widest font-black">
                Redes en Sincronización...
              </p>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
}