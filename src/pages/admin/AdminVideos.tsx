import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Video, Plus, Loader2, Trash2 } from 'lucide-react';

export default function AdminVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setVideos(data);
  };

  // Función mágica para sacar el ID del video de cualquier link de YouTube
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const youtubeId = extractYoutubeId(youtubeUrl);

    if (!title || !youtubeId) {
      alert('Por favor ingresa un título y un enlace de YouTube válido.');
      return;
    }

    setIsUploading(true);

    try {
      // YouTube genera automáticamente esta imagen para cada video
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

      // Guardar en la base de datos
      const { error: dbError } = await supabase.from('videos').insert([
        { 
          title, 
          youtube_id: youtubeId, 
          thumbnail_url: thumbnailUrl,
          description
        }
      ]);

      if (dbError) throw dbError;

      // Limpiar formulario y recargar videos
      setTitle('');
      setYoutubeUrl('');
      setDescription('');
      setShowForm(false);
      fetchVideos();
      
    } catch (error: any) {
      alert('Error al guardar el video: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este video?')) return;
    await supabase.from('videos').delete().eq('id', id);
    fetchVideos();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Gestión de Videos</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-5 h-5" /> Nuevo Video</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 rounded-3xl border border-white/5 p-8 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Título del video</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                placeholder="Ej. Sodoma Radar - Episodio 1"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Enlace de YouTube</label>
              <input 
                type="text" 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Descripción (Opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none min-h-[100px]"
              placeholder="Breve descripción del video..."
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isUploading}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
          >
            {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : 'Guardar Video'}
          </button>
        </form>
      )}

      <div className="bg-zinc-900 rounded-3xl border border-white/5 p-8">
        {videos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay videos agregados. ¡Sube tu primer enlace de YouTube!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-black rounded-xl border border-white/5 overflow-hidden group relative">
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title} 
                  className="w-full aspect-video object-cover" 
                />
                <div className="p-4">
                  <h3 className="text-white font-bold truncate">{video.title}</h3>
                  <p className="text-sm text-gray-400 truncate mt-1">{video.description || 'Sin descripción'}</p>
                </div>
                <button 
                  onClick={() => handleDelete(video.id)} 
                  className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}