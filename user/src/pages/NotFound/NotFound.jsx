import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      background: '#FAF9F5'
    }}>
      <SEO title="Page Not Found - 404" description="The page you are looking for does not exist." />
      
      <div style={{
        background: 'rgba(232, 76, 61, 0.1)',
        padding: '20px',
        borderRadius: '50%',
        marginBottom: '24px'
      }}>
        <AlertTriangle size={64} color="var(--danger)" />
      </div>
      
      <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '16px' }}>
        404
      </h1>
      
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '16px' }}>
        Oops! We couldn't find that page.
      </h2>
      
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.6' }}>
        It seems you've taken a wrong turn. The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link to="/" style={{
        background: 'var(--primary-color)',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '30px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '1.1rem',
        boxShadow: '0 4px 12px rgba(46, 139, 87, 0.2)',
        transition: 'transform 0.2s'
      }}>
        Return to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
