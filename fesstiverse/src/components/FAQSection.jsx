import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="faq-item" 
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.5rem 0',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
          color: '#fff',
        }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.02em' }}>{question}</span>
        <span style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
          transition: 'transform 0.3s ease',
          fontSize: '1.5rem',
          color: 'rgba(124, 58, 237, 0.8)'
        }}>
          <iconify-icon icon="solar:alt-arrow-down-linear"></iconify-icon>
        </span>
      </button>
      <div style={{
        maxHeight: isOpen ? '500px' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isOpen ? 1 : 0,
      }}>
        <p style={{ 
          paddingTop: '1rem', 
          color: 'rgba(255, 255, 255, 0.6)', 
          lineHeight: '1.6',
          fontSize: '0.95rem'
        }}>
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: "What is Festiverse '26?",
      answer: "Festiverse '26 is the annual flagship cultural and technical festival of Government Engineering College, Samastipur. It's a grand celebration where tech, culture, and music collide through various competitions and performances."
    },
    {
      question: "How can I register for events?",
      answer: "You can register by clicking the 'Register' button in the navigation bar. You'll need to create an account or login to access the registration form for specific events."
    },
    {
      question: "Is there any registration fee?",
      answer: "We offer an all-access 'Festiverse Bundle' for ₹699, which covers participation in all core events and workshops. Some premium workshops or specialized competitions might have separate nominal fees."
    },
    {
      question: "Can students from other colleges participate?",
      answer: "Absolutely! Festiverse '26 is open to students from all recognized educational institutions. We welcome diverse talent from across the region."
    },
    {
      question: "How do I get my participation certificate?",
      answer: "Certificates will be available for download on our specialized Certificates page shortly after the event concludes. You'll just need your Registration ID to fetch yours."
    }
  ];

  return (
    <section id="faq" style={{ padding: '80px 0', background: '#0a0a0a' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '4rem',
          alignItems: 'start'
        }} className="faq-grid">
          
          {/* Left Side: Information */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <span style={{ 
              color: '#7c3aed', 
              fontWeight: 600, 
              fontSize: '0.9rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em',
              display: 'block',
              marginBottom: '1rem'
            }}>
              Support Center
            </span>
            <h2 style={{ 
              fontSize: '2.8rem', 
              fontWeight: 700, 
              color: '#fff', 
              marginBottom: '1.5rem',
              lineHeight: '1.1'
            }}>
              Frequently Asked <span style={{ color: '#7c3aed' }}>Questions</span>
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Everything you need to know about Festiverse '26. Can't find what you're looking for? 
              Feel free to visit our <a href="/contact" style={{ color: '#7c3aed', textDecoration: 'none' }}>contact page</a>.
            </p>
          </div>

          {/* Right Side: Accordion */}
          <div>
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .faq-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .faq-grid div:first-child {
            position: relative !important;
            top: 0 !important;
            margin-bottom: 2rem;
          }
          h2 {
            font-size: 2.2rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FAQSection;
