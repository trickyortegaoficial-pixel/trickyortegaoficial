import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Video } from '../types';

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
        Videos<span className="text-emerald-500">.</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all group">
            <div className="aspect-video relative overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtube_id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">{video.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
