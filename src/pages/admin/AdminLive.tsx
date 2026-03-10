import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Radio, Loader2 } from 'lucide-react';
import LiveChat from '../../components/LiveChat'; // <--- IMPORTACIÓN CLAVE

export default function AdminLive() {
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: settings } = await supabase.from('settings').select('live_stream_url').single();
    if (settings?.live_stream_url) {
      let url = settings.live_stream_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/').replace('youtube.com/live/', 'youtube.com/embed/');
      setLiveUrl(`${url}?autoplay=1&mute=1&modestbranding=1&rel=0`);
    }
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user);
    setLoading(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] p-4 lg:p-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white uppercase italic tracking-tighter"><Radio className="text-red-500 inline mr-2 animate-pulse" /> Monitor Admin</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 relative bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          {liveUrl && <iframe src={liveUrl} className="absolute inset-0 w-full h-full border-0" allowFullScreen></iframe>}
        </div>
        <div className="lg:col-span-1 bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          {user && <LiveChat user={user} />}
        </div>
      </div>
    </div> 
  );
}