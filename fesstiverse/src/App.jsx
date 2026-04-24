import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { useToast } from './components/Toast';
import { ScrollReveal } from './components/ScrollReveal';
import { apiFetch } from './lib/api';

// ─── CRITICAL PATH: Loaded immediately (home page) ───
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Societies from './components/Societies';
import Faculty from './components/Faculty';
import GalleryCarousel from './components/GalleryCarousel';
import TeamMembers from './components/TeamMembers';
import NoticeBoard from './components/NoticeBoard';
import FestHero from './components/FestHero';
import SponsorMarquee from './components/SponsorMarquee';
import FestEvents from './components/FestEvents';
import FestGallery from './components/FestGallery';
import FestFooter from './components/FestFooter';
import LoginModal from './components/LoginModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FAQSection from './components/FAQSection';
import CampusRegistration from './components/CampusRegistration';
import InterCollegeRegistration from './components/InterCollegeRegistration';

// ─── LAZY LOADED: Only fetched when navigated to ───
const RegistrationPage = lazy(() => import('./components/RegistrationPage'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const EventDetails = lazy(() => import('./components/EventDetails'));
const EventsPage = lazy(() => import('./components/EventsPage'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const HiringForm = lazy(() => import('./components/HiringForm'));
const GalleryPage = lazy(() => import('./components/GalleryPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const SponsorsPage = lazy(() => import('./components/SponsorsPage'));
const CertificatesPage = lazy(() => import('./components/CertificatesPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const PreviousTeamsPage = lazy(() => import('./components/PreviousTeamsPage'));
const SchedulePage = lazy(() => import('./components/SchedulePage'));

// ─── Loading Fallback ───
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#000',
    color: '#ffb300',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '2px',
    gap: '12px'
  }}>
    <div style={{
      width: '24px',
      height: '24px',
      border: '3px solid rgba(255,179,0,0.2)',
      borderTopColor: '#ffb300',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    LOADING...
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);


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

  // ─── Analytics Tracking ───
  useEffect(() => {
    // Generate or retrieve a persistent client ID for accurate unique user tracking
    const getClientId = () => {
      let id = localStorage.getItem('festiverse_client_id');
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('festiverse_client_id', id);
      }
      return id;
    };

    const clientId = getClientId();

    // 1. Record Visit (once per session)
    const recordVisit = async () => {
      try {
        await apiFetch('/api/analytics/visit', { 
          method: 'POST',
          body: JSON.stringify({ clientId })
        });
      } catch (err) {
        console.warn('Analytics visit failed:', err);
      }
    };
    recordVisit();

    // 2. Heartbeat (every 30 seconds for live users)
    const heartbeat = async () => {
      try {
        await apiFetch('/api/analytics/heartbeat', { 
          method: 'POST',
          body: JSON.stringify({ clientId })
        });
      } catch (err) {
        // Silently fail heartbeats
        console.warn('Analytics heartbeat failed:', err);
      }
    };

    heartbeat(); // Initial beat
    const interval = setInterval(heartbeat, 30000);
    return () => clearInterval(interval);
  }, []);

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

        {/* Registration Sections */}
        <ScrollReveal delay={100}><CampusRegistration /></ScrollReveal>
        <ScrollReveal delay={100}><InterCollegeRegistration /></ScrollReveal>

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
      <Suspense fallback={<PageLoader />}>
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
        <Route path="/previous-teams" element={<PreviousTeamsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </div>
  );
}

export default App;
