import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, BookOpen, History, Image as ImageIcon, Info } from 'lucide-react';

export default function AdminHistory() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState({ img1: '', img2: '', img3: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from('settings').select('history_text, history_img_1, history_img_2, history_img_3').single();
    if (data) {
      setContent(data.history_text || '');
      setImages({
        img1: data.history_img_1 || '',
        img2: data.history_img_2 || '',
        img3: data.history_img_3 || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ 
        id: 1, 
        history_text: content,
        history_img_1: images.img1,
        history_img_2: images.img2,
        history_img_3: images.img3
      });

    if (error) alert("Error al guardar: " + error.message);
    else alert("¡La historia y visuales de Sodoma Studio han sido actualizados! 🦾🔥");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-emerald-500 animate-pulse font-bold">Cargando ecosistema...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
        <History className="text-emerald-500" /> Director de Narrativa
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: TEXTO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Guion de Historia</h2>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl mb-6 flex gap-3 items-start">
              <Info className="text-emerald-500 w-5 h-5 mt-1 shrink-0" />
              <p className="text-xs text-gray-400">
                Usa <strong>doble espacio (Enter x2)</strong> para separar los capítulos. 
                Capítulo 1: El Origen. Capítulo 2: Sodoma Studio. Capítulo 3: El Futuro.
              </p>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[500px] bg-black border border-white/10 rounded-2xl p-6 text-gray-300 focus:border-emerald-500 outline-none transition-all resize-none font-light leading-relaxed"
              placeholder="Escribe la trayectoria aquí..."
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: IMÁGENES */}
        <div className="space-y-6">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Visuales (URLs)</h2>
            </div>

            <div className="space-y-4">
              {['img1', 'img2', 'img3'].map((img, i) => (
                <div key={img}>
                  <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Capítulo {i+1}</label>
                  <input 
                    type="text"
                    value={images[img]}
                    onChange={(e) => setImages({...images, [img]: e.target.value})}
                    placeholder="URL de la imagen..."
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-8 flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> PUBLICAR CAMBIOS</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}