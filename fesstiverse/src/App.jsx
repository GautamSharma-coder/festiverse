import { useState } from 'react';
import './App.css';

// UDAAN Component
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
import EventsDashboard from './components/EventsDashboard';
import FestGallery from './components/FestGallery';
import LoginModal from './components/LoginModal';
import FestFooter from './components/FestFooter';

function App() {
  const [isFestiverse, setIsFestiverse] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleUniverse = () => {
    setIsFestiverse((prev) => !prev);
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="antialiased">
      {/* Navbar */}
      <Navbar isFestiverse={isFestiverse} toggleUniverse={toggleUniverse} />

      {/* UDAAN View */}
      <main className={`app-view ${isFestiverse ? 'hidden-view' : ''}`}>
        <HeroSection />
        <Societies />
        <GalleryCarousel />
        <TeamMembers />
        <NoticeBoard />
      </main>

      {/* FESTIVERSE View */}
      <main className={`app-view ${!isFestiverse ? 'hidden-view' : ''}`}>
        <FestHero onLoginClick={() => setShowLoginModal(true)} />
        <SponsorMarquee />

        <section id="register" style={{ padding: '5rem 0', maxWidth: '56rem', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {!isLoggedIn ? (
            <RegistrationForm />
          ) : (
            <EventsDashboard />
          )}
        </section>

        <FestGallery />
        <FestFooter />
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default App;
