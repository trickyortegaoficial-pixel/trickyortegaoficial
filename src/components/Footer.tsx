import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Music, Facebook, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [socials, setSocials] = useState(null);

  useEffect(() => {
    const fetchSocials = async () => {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setSocials({
          instagram: data.instagram_url,
          youtube: data.youtube_url,
          spotify: data.spotify_url,
          facebook: data.facebook_url,
          tiktok: data.tiktok_url
        });
      }
    };
    fetchSocials();
  }, []);

  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* LOGO Y COPYRIGHT */}
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase italic">
              TRICKY ORTEGA<span className="text-emerald-500">.</span>
            </Link>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
              Sodoma Studio &copy; {new Date().getFullYear()} • Arquitecto de Realidades
            </p>
          </div>
          
          {/* REDES SOCIALES DINÁMICAS */}
          <div className="flex items-center gap-6">
            {socials?.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-500 transition-all hover:scale-110">
                <Instagram className="h-6 w-6" />
              </a>
            )}
            
            {socials?.youtube && (
              <a href={socials.youtube} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600 transition-all hover:scale-110">
                <Youtube className="h-6 w-6" />
              </a>
            )}
            
            {socials?.spotify && (
              <a href={socials.spotify} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-500 transition-all hover:scale-110">
                <Music className="h-6 w-6" />
              </a>
            )}

            {socials?.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-all hover:scale-110">
                <Facebook className="h-6 w-6" />
              </a>
            )}

            {/* Icono de respaldo si no hay redes */}
            {!socials?.instagram && !socials?.youtube && !socials?.spotify && (
              <span className="text-zinc-800"><Share2 size={20} /></span>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
}