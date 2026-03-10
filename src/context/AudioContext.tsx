import { createContext, useContext, useState, ReactNode } from 'react';
import { Song } from '../types';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentSong) setIsPlaying(!isPlaying);
  };

  return (
    <AudioContext.Provider value={{ currentSong, isPlaying, playSong, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
}

// Exportamos el hook exactamente con el nombre que tienes en tu archivo Music.tsx
export const useAudioStore = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudioStore debe usarse dentro de un AudioProvider');
  return context;
};