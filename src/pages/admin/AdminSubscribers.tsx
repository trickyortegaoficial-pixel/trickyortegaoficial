import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Users, Trash2, User as UserIcon, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminSubscribers() {
  const [activeTab, setActiveTab] = useState<'messages' | 'fans'>('messages');
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'messages') {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setMessages(data);
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setProfiles(data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (table: 'messages' | 'profiles', id: string) => {
    if (!window.confirm(`¿Seguro que quieres eliminar este ${table === 'messages' ? 'mensaje' : 'perfil'}?`)) return;
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">
        Gestión de <span className="text-emerald-500 font-outline">Audiencia</span>
      </h1>
      
      {/* Sistema de Pestañas Estilo Sodoma */}
      <div className="flex gap-2 mb-8 bg-zinc-900/50 p-1 rounded-2xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab('messages')}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest",
            activeTab === 'messages' 
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
              : "text-gray-500 hover:text-white"
          )}
        >
          <Mail className="w-4 h-4" /> Bandeja
        </button>
        <button
          onClick={() => setActiveTab('fans')}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest",
            activeTab === 'fans' 
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
              : "text-gray-500 hover:text-white"
          )}
        >
          <Users className="w-4 h-4" /> Fans VIP
        </button>
      </div>

      <div className="bg-zinc-900/30 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Sincronizando Realidad...</p>
          </div>
        ) : activeTab === 'messages' ? (
          /* VISTA DE MENSAJES */
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-12 italic">Bandeja de entrada vacía.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-black/40 hover:bg-black/60 p-6 rounded-2xl border border-white/5 transition-all group relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 uppercase font-black">
                        {msg.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{msg.name}</h3>
                        <p className="text-emerald-500/60 text-xs font-mono">{msg.email}</p>
                      </div>
                    </div>
                    <span className="text-gray-600 text-[10px] uppercase tracking-tighter">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-gray-300 font-light leading-relaxed border-l-2 border-zinc-800 pl-4">{msg.message}</p>
                  <button 
                    onClick={() => handleDelete('messages', msg.id)}
                    className="absolute top-6 right-6 p-2 text-zinc-700 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* VISTA DE FANS (PROFILES) - TABLA PRO */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/50 text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-black">
                  <th className="px-8 py-5">Usuario</th>
                  <th className="px-8 py-5">Contacto</th>
                  <th className="px-8 py-5">Rango</th>
                  <th className="px-8 py-5">Miembro desde</th>
                  <th className="px-8 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-500 italic">No hay registros en el ecosistema.</td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 text-zinc-500">
                              <UserIcon size={18} />
                            </div>
                          )}
                          <span className="text-white font-bold">{profile.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-emerald-500 transition-colors">
                          <Mail size={14} />
                          <span className="text-sm font-light">{profile.email || 'Sin correo'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          profile.role === 'admin' 
                            ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" 
                            : "border-zinc-800 text-zinc-500"
                        )}>
                          {profile.role === 'admin' ? 'Master Admin' : 'Fan VIP'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                          <Calendar size={12} />
                          {formatDate(profile.created_at)}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleDelete('profiles', profile.id)}
                          className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}