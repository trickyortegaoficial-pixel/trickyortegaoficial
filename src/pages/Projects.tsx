import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
        Proyectos<span className="text-emerald-500">.</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all bg-zinc-900">
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={project.cover_url || 'https://picsum.photos/seed/project/800/600'} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-500 transition-colors">{project.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
