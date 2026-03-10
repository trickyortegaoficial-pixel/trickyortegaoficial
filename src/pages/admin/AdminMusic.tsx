import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Music, Plus, Loader2, Trash2 } from 'lucide-react';

export default function AdminMusic() {
  const [songs, setSongs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSongs(data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !audioFile || !coverFile) {
      alert('Por favor llena todos los campos y selecciona los archivos.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Subir portada al bucket 'media'
      const coverExt = coverFile.name.split('.').pop();
      const coverPath = `covers/${Date.now()}.${coverExt}`;
      const { data: coverData, error: coverError } = await supabase.storage
        .from('media')
        .upload(coverPath, coverFile);
      
      if (coverError) throw coverError;

      // 2. Subir audio al bucket 'media'
      const audioExt = audioFile.name.split('.').pop();
      const audioPath = `audio/${Date.now()}.${audioExt}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('media')
        .upload(audioPath, audioFile);

      if (audioError) throw audioError;

      // 3. Obtener URLs públicas
      const coverUrl = supabase.storage.from('media').getPublicUrl(coverPath).data.publicUrl;
      const audioUrl = supabase.storage.from('media').getPublicUrl(audioPath).data.publicUrl;

      // 4. Guardar en la base de datos
      const { error: dbError } = await supabase.from('songs').insert([
        { 
          title, 
          audio_url: audioUrl, 
          cover_url: coverUrl 
        }
      ]);

      if (dbError) throw dbError;

      // Limpiar formulario y recargar canciones
      setTitle('');
      setAudioFile(null);
      setCoverFile(null);
      setShowForm(false);
      fetchSongs();
      
    } catch (error: any) {
      alert('Error al subir la canción: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este track?')) return;
    await supabase.from('songs').delete().eq('id', id);
    fetchSongs();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Gestión de Música</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-5 h-5" /> Nueva Canción</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="bg-zinc-900 rounded-3xl border border-white/5 p-8 mb-8 space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Título de la canción</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
              placeholder="Ej. Track 01"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Archivo de Audio (MP3/WAV)</label>
              <input 
                type="file" 
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Portada (JPG/PNG)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isUploading}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
          >
            {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo al servidor...</> : 'Guardar Track'}
          </button>
        </form>
      )}

      <div className="bg-zinc-900 rounded-3xl border border-white/5 p-8">
        {songs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay música subida todavía. ¡Agrega tu primer track!</p>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center justify-between p-4 bg-black rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <img src={song.cover_url} alt="cover" className="w-12 h-12 rounded-md object-cover" />
                  <div>
                    <h3 className="text-white font-bold">{song.title}</h3>
                    <audio src={song.audio_url} controls className="h-8 mt-2 max-w-xs" />
                  </div>
                </div>
                <button onClick={() => handleDelete(song.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}