import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  Music, 
  Video, 
  Folder, 
  Users, 
  Mail, 
  LogOut, 
  Activity, 
  BookOpen,
  Radio // <-- 1. Importamos el ícono de Radio
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: Activity },
  { name: 'Música', path: '/admin/music', icon: Music },
  { name: 'Historia', path: '/admin/history', icon: BookOpen },
  { name: 'Videos', path: '/admin/videos', icon: Video },
  { name: 'Live Monitor', path: '/admin/live', icon: Radio }, // <-- 2. AÑADIMOS LA LÍNEA AQUÍ
  { name: 'Proyectos', path: '/admin/projects', icon: Folder },
  { name: 'Comunidad', path: '/admin/community', icon: Users },
  { name: 'Suscriptores', path: '/admin/subscribers', icon: Mail },
  { name: 'Configuración', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    verifyAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        navigate('/admin/login');
      } else if (event === 'SIGNED_IN' || session) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const verifyAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setIsAuthenticated(false);
        navigate('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    } catch (err) {
      setIsAuthenticated(false);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-emerald-500 font-bold">
        <div className="flex flex-col items-center gap-4">
          <Activity className="animate-spin w-10 h-10" />
          <span>Verificando seguridad de Sodoma Studio...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold tracking-tighter text-white">
            SODOMA<span className="text-emerald-500">.</span>ADMIN
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}