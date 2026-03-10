import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExclusiveContent } from '../types';
import { Lock, LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import LiveChat from '../components/LiveChat'; 

export default function Community() {
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<ExclusiveContent[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
    </div>
  );

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
          <h1 className="text-4xl md:text-6xl font-black">COMUNIDAD VIP<span className="text-emerald-500">.</span></h1>
          <p className="text-gray-400 mt-2">Bienvenido, {user.email}</p>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-gray-400 rounded-xl hover:text-red-500 transition-all">
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {content.length === 0 ? (
            <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-white/5">
              <p className="text-gray-400">Preparando nuevo material exclusivo... Vuelve pronto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.map((item) => (
                <div key={item.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-6">{item.description}</p>
                  <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    {item.media_type === 'image' ? (
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.media_url} controls className="w-full h-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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