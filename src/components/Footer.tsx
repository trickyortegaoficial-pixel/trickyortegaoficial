import { Link } from 'react-router-dom';
import { Instagram, Youtube, Music, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
              TRICKY ORTEGA<span className="text-emerald-500">.</span>
            </Link>
            <p className="text-gray-400 text-sm mt-2">
              Official Website &copy; {new Date().getFullYear()}
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Youtube className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Music className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Heart className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
