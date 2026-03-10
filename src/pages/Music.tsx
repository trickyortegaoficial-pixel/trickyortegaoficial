import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Song } from '../types';
import { useAudioStore } from '../context/AudioContext';
import { Play, Pause, ExternalLink } from 'lucide-react';

export default function Music() {
  const [songs, setSongs] = useState<Song[]>([]);
  const { currentSong, isPlaying, playSong, togglePlay } = useAudioStore();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    if (data) setSongs(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
        Music<span className="text-emerald-500">.</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {songs.map((song) => (
          <div key={song.id} className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all">
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={song.cover_url} 
                alt={song.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => currentSong?.id === song.id ? togglePlay() : playSong(song)}
                  className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform"
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{song.title}</h3>
              <div className="flex gap-4 mt-4">
                {song.spotify_url && (
                  <a href={song.spotify_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-500 transition-colors">
                    Spotify
                  </a>
                )}
                {song.youtube_url && (
                  <a href={song.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
                    YouTube
                  </a>
                )}
                {song.apple_music_url && (
                  <a href={song.apple_music_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Apple Music
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
