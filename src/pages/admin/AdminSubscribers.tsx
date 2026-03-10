import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Users, Trash2, User as UserIcon } from 'lucide-react';
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

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este mensaje?')) return;
    await supabase.from('messages').delete().eq('id', id);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Audiencia y Contacto</h1>
      
      {/* Sistema de Pestañas */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('messages')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
            activeTab === 'messages' 
              ? "bg-emerald-500 text-black" 
              : "bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Mail className="w-5 h-5" />
          Bandeja de Entrada
        </button>
        <button
          onClick={() => setActiveTab('fans')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
            activeTab === 'fans' 
              ? "bg-emerald-500 text-black" 
              : "bg-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Users className="w-5 h-5" />
          Fans Registrados
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="bg-zinc-900 rounded-3xl border border-white/5 p-8 min-h-[400px]">
        {isLoading ? (
          <p className="text-emerald-500 text-center py-8 font-bold animate-pulse">Cargando datos...</p>
        ) : activeTab === 'messages' ? (
          // VISTA DE MENSAJES
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay mensajes nuevos en tu bandeja.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-black p-6 rounded-2xl border border-white/5 relative group">
                  <div className="pr-12">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{msg.name}</h3>
                      <span className="text-emerald-500 text-sm">{msg.email}</span>
                      <span className="text-gray-600 text-xs ml-auto">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="text-gray-400 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="absolute top-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          // VISTA DE FANS (PROFILES)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.length === 0 ? (
              <p className="text-gray-400 text-center py-8 col-span-full">Aún no tienes fans registrados en la plataforma.</p>
            ) : (
              profiles.map((profile) => (
                <div key={profile.id} className="bg-black p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20">
                      <UserIcon className="w-6 h-6 text-emerald-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold">{profile.username || 'Usuario VIP'}</h3>
                    <p className="text-sm text-emerald-500 uppercase tracking-wider text-xs font-bold mt-1">
                      {profile.role === 'admin' ? '⭐ Administrador' : 'Fan Exclusivo'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}