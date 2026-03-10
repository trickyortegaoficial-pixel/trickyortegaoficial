import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Loader2, Trash2, Image as ImageIcon, Film, Lock } from 'lucide-react';

export default function AdminCommunity() {
  const [contents, setContents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  useEffect(() => {
    fetchExclusiveContent();
  }, []);

  const fetchExclusiveContent = async () => {
    const { data, error } = await supabase
      .from('exclusive_content')
      .select('*')
      .order('id', { ascending: false }); // Usamos ID para ordenar del más nuevo al más viejo
    
    if (data) setContents(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaFile) {
      alert('Por favor agrega un título y un archivo (foto o video).');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Detectar si es imagen o video
      const isVideo = mediaFile.type.startsWith('video/');
      const mediaType = isVideo ? 'video' : 'image';
      
      // 2. Subir al bucket (Usaremos el bucket 'exclusive-media')
      const fileExt = mediaFile.name.split('.').pop();
      const filePath = `post_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('exclusive-media')
        .upload(filePath, mediaFile);
      
      if (uploadError) throw uploadError;

      // 3. Obtener URL pública (Para simplificar la carga en la web, la URL se genera, 
      // pero la tabla exclusive_content estará protegida para que solo fans la lean)
      const mediaUrl = supabase.storage.from('exclusive-media').getPublicUrl(filePath).data.publicUrl;

      // 4. Guardar en base de datos
      const { error: dbError } = await supabase.from('exclusive_content').insert([
        { 
          title, 
          description,
          media_url: mediaUrl,
          media_type: mediaType
        }
      ]);

      if (dbError) throw dbError;

      // Limpiar formulario y recargar
      setTitle('');
      setDescription('');
      setMediaFile(null);
      setShowForm(false);
      fetchExclusiveContent();
      
    } catch (error: any) {
      alert('Error al publicar contenido: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta publicación exclusiva?')) return;
    await supabase.from('exclusive_content').delete().eq('id', id);
    fetchExclusiveContent();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Lock className="w-8 h-8 text-emerald-500" /> Contenido Exclusivo
          </h1>
          <p className="text-gray-400 mt-2">Solo visible para fans con sesión iniciada.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-5 h-5" /> Nuevo Post</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 rounded-3xl border border-emerald-500/20 p-8 mb-8 space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Título del Post VIP</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
              placeholder="Ej. Detrás de cámaras: Grabación de ADN.33"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Descripción o Mensaje (Opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none min-h-[100px]"
              placeholder="Escribe algo para tus fans más leales..."
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Archivo (Foto o Video corto)</label>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                {mediaFile?.type.startsWith('video/') ? (
                  <Film className="w-6 h-6 text-emerald-500" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-emerald-500" />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isUploading}
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
          >
            {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo al servidor VIP...</> : 'Publicar para Fans'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {contents.length === 0 ? (
          <div className="bg-zinc-900 rounded-3xl border border-white/5 p-8 text-center">
            <p className="text-gray-400">Aún no hay contenido VIP. ¡Sube algo especial para tu comunidad!</p>
          </div>
        ) : (
          contents.map((post) => (
            <div key={post.id} className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row gap-6 relative group">
              <div className="w-full md:w-1/3 aspect-square md:aspect-auto bg-black flex items-center justify-center">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media_url} alt={post.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold w-max mb-3">
                  <Lock className="w-3 h-3" /> EXCLUSIVO
                </div>
                <h3 className="text-2xl text-white font-bold mb-2">{post.title}</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{post.description}</p>
              </div>
              <button 
                onClick={() => handleDelete(post.id)} 
                className="absolute top-4 right-4 p-2 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}