import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { useToast } from './components/Toast';
import { ScrollReveal } from './components/ScrollReveal';

// UDAAN Components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Societies from './components/Societies';
import GalleryCarousel from './components/GalleryCarousel';
import TeamMembers from './components/TeamMembers';
import NoticeBoard from './components/NoticeBoard';

// FESTIVERSE Components
import FestHero from './components/FestHero';
import SponsorMarquee from './components/SponsorMarquee';
import RegistrationForm from './components/RegistrationForm';
import FestGallery from './components/FestGallery';
import LoginModal from './components/LoginModal';
import FestFooter from './components/FestFooter';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';

function App() {
  const [isFestiverse, setIsFestiverse] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { ToastContainer, showToast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('festiverse_token');
    const savedUser = localStorage.getItem('festiverse_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('festiverse_token');
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

  const handleLogout = () => {
    localStorage.removeItem('festiverse_token');
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
        <ScrollReveal delay={100}><TeamMembers /></ScrollReveal>
        <ScrollReveal delay={100}><NoticeBoard /></ScrollReveal>
      </main>

      {/* FESTIVERSE View */}
      <main className={`app-view ${!isFestiverse ? 'hidden-view' : ''}`}>
        <FestHero
          onLoginClick={() => setShowLoginModal(true)}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          onDashboardClick={() => navigate('/dashboard')}
        />
        <SponsorMarquee />

        {!isLoggedIn && (
          <ScrollReveal>
            <section id="register" style={{ padding: '5rem 0', maxWidth: '56rem', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <RegistrationForm onRegister={handleLogin} showToast={showToast} />
            </section>
          </ScrollReveal>
        )}

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
      </Routes>
    </div>
  );
}

export default App;
