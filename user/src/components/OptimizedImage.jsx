import React, { useState } from 'react';

const resolveImagePath = (path) => {
  if (!path) return '';
  let clean = path;

  if (clean.startsWith('http')) return clean;

  const backendUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : 'http://127.0.0.1:5000';

  if (clean.startsWith('/assets/') || clean.startsWith('assets/') || clean.startsWith('/api/assets/')) {
    if (clean.startsWith('/api/assets/')) {
      clean = clean.substring(12);
    } else if (clean.startsWith('assets/')) {
      clean = clean.substring(7);
    } else if (clean.startsWith('/assets/')) {
      clean = clean.substring(8);
    }
    return `${backendUrl}/assets/${clean}`;
  }

  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    if (clean.startsWith('/')) clean = clean.substring(1);
    return `${backendUrl}/${clean}`;
  }

  return clean;
};

const OptimizedImage = ({ src, alt, className, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const resolvedSrc = resolveImagePath(src);

  return (
    <div style={{ position: 'relative', width: style?.width || '100%', height: style?.height || '100%', ...style }}>
      {!loaded && (
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#f0f0f0',
            animation: 'pulse 1.5s infinite ease-in-out',
            borderRadius: style?.borderRadius || 'inherit'
          }}
        />
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: style?.objectFit || 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          borderRadius: style?.borderRadius || 'inherit',
          ...style
        }}
        {...props}
      />
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;
