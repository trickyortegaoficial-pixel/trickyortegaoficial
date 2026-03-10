/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingPlayer from './components/FloatingPlayer';
import { AudioProvider } from './context/AudioContext';

// Pages
import Home from './pages/Home';
import Music from './pages/Music';
import Videos from './pages/Videos';
import History from './pages/History';
import Projects from './pages/Projects';
import Community from './pages/Community';
import LiveStream from './pages/LiveStream';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminMusic from './pages/admin/AdminMusic';
import AdminVideos from './pages/admin/AdminVideos';
import AdminProjects from './pages/admin/AdminProjects';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSubscribers from './pages/admin/AdminSubscribers';
import AdminHistory from './pages/admin/AdminHistory';
import AdminLive from './pages/admin/AdminLive'; // <--- IMPORTACIÓN DEL MONITOR

// Layout Público para fans
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <FloatingPlayer /> 
    </>
  );
};

export default function App() {
  return (
    <AudioProvider>
      <Router>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
          <Routes>
            
            {/* 1. RUTAS PÚBLICAS */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/music" element={<Music />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/history" element={<History />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/community" element={<Community />} />
              <Route path="/live" element={<LiveStream />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* 2. RUTAS DE ADMIN */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminSettings />} /> 
              <Route path="music" element={<AdminMusic />} />
              <Route path="history" element={<AdminHistory />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="live" element={<AdminLive />} /> {/* <--- RUTA DEL MONITOR AÑADIDA */}
              <Route path="community" element={<AdminCommunity />} />
              <Route path="subscribers" element={<AdminSubscribers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

          </Routes>
        </div>
      </Router>
    </AudioProvider>
  );
}