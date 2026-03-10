import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Loader2, BookOpen } from 'lucide-react';

export default function History() {
  const [historyText, setHistoryText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase.from('settings').select('history_text').single();
      if (data) setHistoryText(data.history_text);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">
          HISTORIA<span className="text-emerald-500">.</span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Trayectoria de Tricky Ortega</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-8 md:p-12 rounded-3xl"
      >
        {/* Usamos white-space: pre-wrap para que respete los saltos de línea que hagas en el Admin */}
        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
          {historyText || "Nuestra historia se está escribiendo... Vuelve pronto para conocer más sobre Sodoma Studio."}
        </p>
      </motion.div>

      {/* Decoración visual de fondo */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
    </div>
  );
}