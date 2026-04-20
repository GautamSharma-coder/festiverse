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
import EventsPage from './components/EventsPage';
import Leaderboard from './components/Leaderboard';
import HiringForm from './components/HiringForm';
import GalleryPage from './components/GalleryPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ContactPage from './components/ContactPage';
import SponsorsPage from './components/SponsorsPage';
import CertificatesPage from './components/CertificatesPage';
import NotFoundPage from './components/NotFoundPage';
import FAQSection from './components/FAQSection';
import RegistrationDetails from './components/RegistrationDetails';

function App() {
  const [isFestiverse, setIsFestiverse] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!localStorage.getItem('festiverse_user');
    } catch {
      return false;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('festiverse_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('festiverse_user');
      return null;
    }
  });
  const navigate = useNavigate();
  const { ToastContainer, showToast } = useToast();

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
  const homePageContent = (
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

        <ScrollReveal delay={100}><RegistrationDetails /></ScrollReveal>

        <ScrollReveal delay={100}><FestGallery /></ScrollReveal>
        <ScrollReveal delay={100}><FAQSection /></ScrollReveal>
        <FestFooter onAdminClick={() => navigate('/admin')} />
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
  );

  return (
    <div className="antialiased">
      <PWAInstallPrompt />
      <ToastContainer />
      <Routes>
        <Route path="/" element={homePageContent} />
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
              homePageContent
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
          path="/events"
          element={<EventsPage />}
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
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
