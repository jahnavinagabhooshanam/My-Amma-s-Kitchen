import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/img/logo.png';
import img1 from '../../assets/img/hero/new_hero_1.webp';
import img2 from '../../assets/img/hero/new_hero_2.webp';
import img3 from '../../assets/img/hero/new_hero_3.webp';
import './Auth.css';

// Premium South Indian Food Images for the slider
const images = [
  {
    url: img1,
    title: 'Aromatic North Indian Specialities',
    desc: 'Slow-cooked to perfection with premium spices and tender meat.'
  },
  {
    url: img2,
    title: 'Authentic South Indian Thali',
    desc: 'A complete balanced feast with traditional flavors and spices.'
  },
  {
    url: img3,
    title: 'Rich & Spicy Curries',
    desc: 'Crafted with passion using handpicked ingredients and authentic recipes.'
  }
];

const AuthLayout = ({ children, title, subtitle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-form-side">
          <div className="auth-glass-card">
            <div className="auth-header" style={{ textAlign: 'center' }}>
              <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', textDecoration: 'none' }}>
                <img src={logoImg} alt="Amma's Kitchen Logo" style={{ maxHeight: '200px', width: 'auto', marginBottom: '8px' }} />
              </Link>
              <h1 className="auth-title" style={{ textAlign: 'left' }}>{title}</h1>
              <p className="auth-subtitle" style={{ textAlign: 'left' }}>{subtitle}</p>
            </div>

            <div className="auth-form-wrapper">
              {children}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <a href="http://localhost:5174/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }}>Access Admin Portal</a>
          </div>
        </div>

        <div className="auth-image-side">
          <div className="slider-container">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`slide ${idx === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${img.url})` }}
              >
                <div className="slide-overlay">
                  <h2 className="slide-title">{img.title}</h2>
                  <p className="slide-desc">{img.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
