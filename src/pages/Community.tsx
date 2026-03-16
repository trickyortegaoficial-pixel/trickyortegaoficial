import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExclusiveContent } from '../types';
import { Lock, LogOut, Loader2, Plus, Music, Trash2 } from 'lucide-react';
import LiveChat from '../components/LiveChat'; 

export default function Community() {
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<ExclusiveContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const ADMIN_EMAIL = "trickyortegaoficial@gmail.com";

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchContent();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) fetchContent();
    setLoading(false);
  };

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('exclusive_content')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setContent(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `exclusive/${fileName}`;

      // SUBIDA AL STORAGE
      const { error: uploadError } = await supabase.storage
        .from('exclusive_content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('exclusive_content')
        .getPublicUrl(filePath);

      // --- DETECCIÓN DE TIPO ---
      let media_type = 'image';
      if (file.type.includes('video')) media_type = 'video';
      if (file.type.includes('audio')) media_type = 'audio';

      // SUBIDA A LA TABLA
      const { error: dbError } = await supabase
        .from('exclusive_content')
        .insert([{
          title: file.name.split('.')[0],
          description: `Nuevo track/material: ${media_type}`,
          media_url: publicUrl,
          media_type: media_type,
          user_id: user.id
        }]);

      if (dbError) throw dbError;
      fetchContent(); 
    } catch (error: any) {
      alert("Error: " + error.message + ". Revisa el SQL de abajo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Borrar material?")) return;
    const { error } = await supabase.from('exclusive_content').delete().eq('id', id);
    if (!error) fetchContent();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: window.location.origin + '/community' }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setContent([]); 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>;

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <Lock className="w-20 h-20 mx-auto text-emerald-500 mb-8" />
      <h1 className="text-5xl font-black mb-6">COMUNIDAD VIP.</h1>
      <button onClick={handleGoogleLogin} className="px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center gap-3 mx-auto">
        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
        Entrar con Google
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">COMUNIDAD <span className="text-emerald-500">VIP.</span></h1>
          <p className="text-gray-400 mt-2">Bienvenido, {user.email}</p>
        </div>
        
        <div className="flex gap-4">
          {user.email === ADMIN_EMAIL && (
            <label className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-black rounded-xl cursor-pointer hover:bg-white transition-all">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              SUBIR MATERIAL
              {/* ¡AQUÍ ESTÁ EL TRUCO! Agregamos audio/* en accept */}
              <input type="file" hidden onChange={handleUpload} accept="image/*,video/*,audio/*" />
            </label>
          )}
          <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-gray-400 rounded-xl hover:text-red-500 transition-all">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.map((item) => (
              <div key={item.id} className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{item.title}</h3>
                  {user.email === ADMIN_EMAIL && (
                    <button onClick={() => handleDelete(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  )}
                </div>
                
                <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  {/* --- RENDERIZADO POR TIPO --- */}
                  {item.media_type === 'image' && <img src={item.media_url} className="w-full h-full object-cover" />}
                  {item.media_type === 'video' && <video src={item.media_url} controls className="w-full h-full" />}
                  
                  {/* SI ES AUDIO, MOSTRAMOS EL REPRODUCTOR */}
                  {item.media_type === 'audio' && (
                    <div className="flex flex-col items-center gap-4 w-full p-6 text-center">
                      <Music className="text-emerald-500 w-12 h-12 animate-pulse" />
                      <audio src={item.media_url} controls className="w-full h-8" />
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Audio Exclusivo</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <LiveChat user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}