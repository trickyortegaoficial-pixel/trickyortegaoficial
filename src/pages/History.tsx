import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowDown } from 'lucide-react';

export default function History() {
  const [historyData, setHistoryData] = useState({ text: '', imgs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // Traemos todos los campos de settings
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setHistoryData({
          text: data.history_text || '',
          imgs: [data.history_img_1, data.history_img_2, data.history_img_3]
        });
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // Dividimos el texto en capítulos
  const chapters = historyData.text.split('\n\n').filter(text => text.trim() !== '');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black text-white">
      {/* SECCIÓN HERO */}
      <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="z-10 text-center"
        >
          <h1 className="text-7xl md:text-[12rem] font-black uppercase tracking-tighter leading-none">
            HI<span className="text-emerald-500">ST</span>ORIA
          </h1>
          <p className="text-emerald-500 tracking-[0.5em] font-bold uppercase mt-4 text-sm md:text-base">
            Tricky Ortega • Sodoma Studio
          </p>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50"
        >
          <span className="text-xs uppercase tracking-widest text-emerald-500">Scroll para explorar</span>
          <ArrowDown className="w-5 h-5 text-emerald-500" />
        </motion.div>
      </section>

      {/* CAPÍTULOS DINÁMICOS */}
      {chapters.map((text, index) => (
        <section key={index} className="relative min-h-screen flex items-center py-24 overflow-hidden">
          {/* Fondo Dinámico: Usa la imagen del Admin o una por defecto si está vacío */}
          <div 
            className="absolute inset-0 bg-fixed bg-cover bg-center z-0"
            style={{ 
              backgroundImage: `url('${historyData.imgs[index] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}')`,
              filter: 'grayscale(100%) brightness(30%)' 
            }}
          />
          
          <div className="container mx-auto px-6 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <span className="text-emerald-500 font-black text-7xl md:text-9xl opacity-10 block -mb-8 md:-mb-12">
                  0{index + 1}
                </span>
                <h2 className="text-4xl md:text-7xl font-black uppercase mb-8 leading-tight italic">
                  Capítulo <span className="text-emerald-500">{['I', 'II', 'III'][index] || 'X'}</span>
                </h2>
                <p className="text-xl md:text-3xl text-gray-200 leading-relaxed font-light whitespace-pre-wrap border-l-4 border-emerald-500 pl-8 md:pl-12">
                  {text}
                </p>
              </motion.div>
            </div>
          </div>
          
          {/* Capa de oscuridad para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent z-0 pointer-events-none" />
        </section>
      ))}

      {/* CIERRE */}
      <section className="h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-8">El juego apenas comienza.</h2>
          <button className="border-2 border-emerald-500 text-emerald-500 font-bold px-10 py-4 rounded-full text-lg hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-tighter">
            Volver al Inicio
          </button>
        </motion.div>
      </section>
    </div>
  );
}