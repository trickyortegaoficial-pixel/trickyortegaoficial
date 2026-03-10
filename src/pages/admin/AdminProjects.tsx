import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Folder, Plus, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    // Jalamos los proyectos y los ordenamos por el más reciente
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: false });
    
    if (data) setProjects(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !coverFile) {
      alert('Por favor llena todos los campos y sube una imagen de portada.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Subir la imagen al bucket 'media' en una subcarpeta llamada 'projects'
      const fileExt = coverFile.name.split('.').pop();
      const filePath = `projects/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, coverFile);
      
      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública de la imagen
      const coverUrl = supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;

      // 3. Guardar en la base de datos
      const { error: dbError } = await supabase.from('projects').insert([
        { 
          title, 
          description,
          cover_url: coverUrl 
        }
      ]);

      if (dbError) throw dbError;

      // Limpiar formulario y recargar la lista
      setTitle('');
      setDescription('');
      setCoverFile(null);
      setShowForm(false);
      fetchProjects();
      
    } catch (error: any) {
      alert('Error al guardar el proyecto: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este proyecto del portafolio?')) return;
    await supabase.from('projects').delete().eq('id', id);
    fetchProjects();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Gestión de Proyectos</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-5 h-5" /> Nuevo Proyecto</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 rounded-3xl border border-white/5 p-8 mb-8 space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Título del Proyecto</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
              placeholder="Ej. ADN.33 - Álbum Conceptual"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Descripción</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 outline-none min-h-[100px]"
              placeholder="Detalles sobre el proceso, cliente, tecnologías, etc."
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Imagen de Portada (JPG/PNG)</label>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <ImageIcon className="w-6 h-6 text-emerald-500" />
              </div>
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
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
          >
            {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo y Guardando...</> : 'Publicar Proyecto'}
          </button>
        </form>
      )}

      <div className="bg-zinc-900 rounded-3xl border border-white/5 p-8">
        {projects.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Tu portafolio está vacío. ¡Sube tu primer proyecto!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-black rounded-xl border border-white/5 overflow-hidden group relative">
                <img 
                  src={project.cover_url} 
                  alt={project.title} 
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="p-5">
                  <h3 className="text-xl text-white font-bold mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3">{project.description}</p>
                </div>
                {/* Botón de borrar oculto que aparece al hacer hover */}
                <button 
                  onClick={() => handleDelete(project.id)} 
                  className="absolute top-3 right-3 p-2 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Eliminar proyecto"
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