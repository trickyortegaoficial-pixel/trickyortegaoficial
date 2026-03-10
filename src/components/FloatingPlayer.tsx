import { useEffect, useRef } from 'react';
import { useAudioStore } from '../context/AudioContext';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function FloatingPlayer() {
  const { currentSong, isPlaying, togglePlay } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Este efecto hace que el audio real se reproduzca o pause 
  // cuando el estado cambia desde cualquier parte de tu página
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  if (!currentSong) return null; // Si no hay canción, el reproductor no se muestra

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Info de la canción */}
        <div className="flex items-center gap-4">
          <img src={currentSong.cover_url} alt="cover" className="w-14 h-14 rounded-md object-cover" />
          <div>
            <h4 className="text-white font-bold">{currentSong.title}</h4>
            <p className="text-sm text-emerald-500">Sodoma Studio</p>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-6">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
        </div>

        {/* Opcional: Volumen o links extra a la derecha para mantener balanceado el diseño */}
        <div className="hidden md:flex items-center gap-2 text-gray-400">
          <Volume2 className="w-5 h-5" />
          <div className="w-24 h-1 bg-gray-800 rounded-full">
            <div className="w-full h-full bg-emerald-500 rounded-full"></div>
          </div>
        </div>

        {/* El motor de audio oculto */}
        <audio 
          ref={audioRef} 
          src={currentSong.audio_url} 
          onEnded={togglePlay} // Pausa cuando termina
        />
      </div>
    </div>
  );
}