import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { useToast } from './components/Toast';
import { ScrollReveal } from './components/ScrollReveal';
import { apiFetch } from './lib/api';

// UDAAN Components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Societies from './components/Societies';
import Faculty from './components/Faculty';
import GalleryCarousel from './components/GalleryCarousel';
import TeamMembers from './components/TeamMembers';
import NoticeBoard from './components/NoticeBoard';

// FESTIVERSE Components
import FestHero from './components/FestHero';
import SponsorMarquee from './components/SponsorMarquee';
import FestEvents from './components/FestEvents';
import RegistrationPage from './components/RegistrationPage';
import FestGallery from './components/FestGallery';
import LoginModal from './components/LoginModal';
import FestFooter from './components/FestFooter';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';
import AboutPage from './components/AboutPage';
import EventDetails from './components/EventDetails';
import Leaderboard from './components/Leaderboard';
import HiringForm from './components/HiringForm';
import GalleryPage from './components/GalleryPage';

function App() {
  const [isFestiverse, setIsFestiverse] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { ToastContainer, showToast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    // On initial load, try to restore user from localStorage cache
    // The httpOnly cookie will be sent automatically with subsequent requests
    const savedUser = localStorage.getItem('festiverse_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('festiverse_user');
      }
    }
  }, []);

  // Keyboard shortcut: Ctrl+Shift+A opens Admin Panel
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const toggleUniverse = () => {
    setIsFestiverse((prev) => !prev);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    navigate('/dashboard'); // Navigate to dashboard after login
  };

  const handleLogout = async () => {
    try {
      // Call backend to clear cookie
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    // Clear frontend state
    localStorage.removeItem('festiverse_user');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/'); // Go back to home
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('festiverse_user', JSON.stringify(updatedUser));
  };

  // ─── Home Page Content ───
  const HomePage = () => (
    <>
      {/* Navbar */}
      <Navbar isFestiverse={isFestiverse} toggleUniverse={toggleUniverse} />

      {/* UDAAN View */}
      <main className={`app-view ${isFestiverse ? 'hidden-view' : ''}`}>
        <HeroSection />
        <ScrollReveal><Societies /></ScrollReveal>
        <ScrollReveal delay={100}><GalleryCarousel /></ScrollReveal>
        <ScrollReveal delay={100}><Faculty /></ScrollReveal>
        <ScrollReveal delay={100}><TeamMembers /></ScrollReveal>
        <ScrollReveal delay={100}><NoticeBoard /></ScrollReveal>
      </main>

      {/* FESTIVERSE View */}
      <main className={`app-view ${!isFestiverse ? 'hidden-view' : ''}`}>
        <FestHero
          onLoginClick={() => setShowLoginModal(true)}
          onRegisterClick={() => navigate('/register')}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          onDashboardClick={() => navigate('/dashboard')}
        />
        <SponsorMarquee />

        {/* Featured Events Section */}
        <ScrollReveal delay={100}><FestEvents /></ScrollReveal>



        <ScrollReveal delay={100}><FestGallery /></ScrollReveal>
        <FestFooter onAdminClick={() => navigate('/admin')} />
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        showToast={showToast}
      />
    </>
  );

  return (
    <div className="antialiased">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <UserDashboard
                user={user}
                onProfileUpdate={handleProfileUpdate}
                onClose={() => navigate('/')}
                onLogout={handleLogout}
              />
            ) : (
              <HomePage />
            )
          }
        />
        <Route
          path="/admin"
          element={<AdminPanel onClose={() => navigate('/')} />}
        />
        <Route
          path="/about"
          element={<AboutPage onClose={() => navigate('/')} />}
        />
        <Route
          path="/events/:id"
          element={<EventDetails />}
        />
        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />
        <Route
          path="/hiring"
          element={<HiringForm onBack={() => navigate('/')} />}
        />
        <Route
          path="/gallery"
          element={<GalleryPage />}
        />
        <Route
          path="/register"
          element={
            <RegistrationPage 
              onRegister={handleLogin} 
              showToast={showToast} 
              onClose={() => navigate('/')} 
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
