import React, { useState } from 'react';
import Navbar from './Navbar';
import FestFooter from './FestFooter';
import { apiFetch } from '../lib/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('CONTACT SUBMIT ERROR:', err);
      setStatus('error');
    }
  };

  const contactInfo = [
    { icon: 'solar:letter-linear', label: 'Email Us', value: 'contact@udaangecsamastipur.in', href: 'mailto:contact@udaangecsamastipur.in' },
    { icon: 'solar:map-point-linear', label: 'Visit Us', value: 'GEC Samastipur, Bihar, India', href: 'https://maps.app.goo.gl/YourMapLink' },
    { icon: 'solar:phone-linear', label: 'Call Us', value: '+91 XXXXX XXXXX', href: 'tel:+91XXXXXXXXXX' },
  ];

  const socialLinks = [
    { name: 'X / Twitter', icon: 'ri:twitter-x-line', href: 'https://x.com/udaan_gecs' },
    { name: 'Instagram', icon: 'ri:instagram-line', href: 'https://www.instagram.com/udaan_gecsamastipur/' },
    { name: 'LinkedIn', icon: 'ri:linkedin-line', href: 'https://www.linkedin.com/in/udaan-arts-and-cultural-club-gec-samastipur-111153254/' },
    { name: 'YouTube', icon: 'ri:youtube-line', href: 'https://www.youtube.com/@udaangecsamastipur3147' },
  ];

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar isFestiverse={true} toggleUniverse={() => {}} />
      
      <main className="contact-main" style={{ paddingBottom: '80px' }}>
        <div className="contact-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="contact-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
             <span className="contact-subtitle" style={{ color: '#7c3aed', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Get in touch</span>
             <h1 className="contact-title" style={{ fontWeight: 800, marginTop: '1rem', letterSpacing: '-0.02em' }}>Contact <span style={{ color: '#7c3aed' }}>Us</span></h1>
             <p className="contact-description" style={{ color: 'rgba(255, 255, 255, 0.5)', margin: '1.5rem auto 0' }}>
               Have questions about events, registrations, or sponsorships? We're here to help you navigate the Festiverse.
             </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '4rem' }} className="contact-grid">
            {/* Left Side: Info */}
            <div>
              <div style={{ display: 'grid', gap: '2rem' }}>
                {contactInfo.map((info, idx) => (
                  <a key={idx} href={info.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '1.5rem',
                      borderRadius: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      transition: 'all 0.3s ease'
                    }} className="info-card">
                      <div style={{
                        width: '50px', height: '50px',
                        background: 'rgba(124, 58, 237, 0.1)',
                        borderRadius: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#7c3aed', fontSize: '1.5rem'
                      }}>
                        <iconify-icon icon={info.icon}></iconify-icon>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500, textTransform: 'uppercase' }}>{info.label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{info.value}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Follow the Buzz</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {socialLinks.map((social) => (
                    <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" 
                       style={{ 
                         width: '45px', height: '45px', 
                         borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', 
                         color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                         fontSize: '1.2rem', transition: 'all 0.3s ease', textDecoration: 'none'
                       }}
                       className="social-hover"
                    >
                      <iconify-icon icon={social.icon}></iconify-icon>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="form-container" style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-row">
                  <div style={inputGroup}>
                    <label style={labelStyle}>Full Name</label>
                    <input 
                      type="text" required placeholder="John Doe" style={inputStyle}
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Email Address</label>
                    <input 
                      type="email" required placeholder="john@example.com" style={inputStyle}
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Subject</label>
                  <input 
                    type="text" required placeholder="How can we help?" style={inputStyle}
                    value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Message</label>
                  <textarea 
                    required placeholder="Tell us more..." rows="5" style={inputStyle}
                    value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  style={{
                    background: '#7c3aed', color: '#fff', border: 'none',
                    padding: '1.2rem', borderRadius: '1rem', fontSize: '1rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.3s ease', marginTop: '1rem',
                    opacity: status === 'sending' ? 0.7 : 1
                  }}
                >
                  {status === 'sending' ? 'Sending Message...' : status === 'success' ? 'Message Sent!' : status === 'error' ? 'Retry Sending' : 'Send Message'}
                </button>
                {status === 'success' && <p style={{ color: '#10b981', textAlign: 'center', fontSize: '0.9rem' }}>We'll get back to you shortly!</p>}
                {status === 'error' && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>Something went wrong. Please try again.</p>}
              </form>
            </div>
          </div>
        </div>
      </main>

      <FestFooter onAdminClick={() => {}} />

      <style>{`
        .contact-main { padding-top: 120px; }
        .contact-container { padding: 0 2rem; }
        .contact-title { font-size: 3.5rem; }
        .contact-description { font-size: 1.2rem; max-width: 600px; }
        .form-container { padding: 3rem; }
        .info-card:hover { transform: translateY(-5px); border-color: rgba(124, 58, 237, 0.3); background: rgba(124, 58, 237, 0.05); }
        .social-hover:hover { background: #7c3aed; transform: scale(1.1); }
        
        @media (max-width: 900px) {
          .contact-main { padding-top: 100px; }
          .contact-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .form-row { grid-template-columns: 1fr !important; }
          .contact-title { font-size: 2.8rem; }
          .form-container { padding: 2rem; }
        }

        @media (max-width: 600px) {
          .contact-main { padding-top: 80px; }
          .contact-container { padding: 0 1.2rem; }
          .contact-title { font-size: 2.2rem; }
          .contact-description { font-size: 1rem; }
          .contact-header { margin-bottom: 3rem !important; }
          .form-container { padding: 1.5rem; border-radius: 1.5rem; }
          .info-card { padding: 1.2rem !important; gap: 1rem !important; }
          .info-card div:last-child div:last-child { font-size: 0.95rem !important; }
        }
      `}</style>
    </div>
  );
};

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '0.6rem' };
const labelStyle = { fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', marginLeft: '0.5rem' };
const inputStyle = {
  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '1rem 1.2rem', borderRadius: '1rem', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s'
};

export default ContactPage;
