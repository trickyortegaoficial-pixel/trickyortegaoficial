import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, BookOpen, History } from 'lucide-react';

export default function AdminHistory() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from('settings').select('history_text').single();
    if (data) setContent(data.history_text || '');
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, history_text: content });

    if (error) alert("Error al guardar: " + error.message);
    else alert("¡Historia actualizada en Sodoma Studio!");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-emerald-500 animate-pulse font-bold">Cargando biografía...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <History className="text-emerald-500" /> Editar Historia / Bio
      </h1>

      <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold">Tu Trayectoria</h2>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-80 bg-black border border-white/10 rounded-2xl p-6 text-gray-300 focus:border-emerald-500 outline-none transition-all resize-none mb-6"
          placeholder="Escribe aquí la historia de Tricky Ortega y el proyecto ADN.33..."
        />

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Historia</>}
          </button>
        </div>
      </div>
    </div>
  );
}