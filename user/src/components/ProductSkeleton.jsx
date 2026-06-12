import React from 'react';
import { motion } from 'framer-motion';

const ProductSkeleton = () => {
  return (
    <div className="modern-menu-card" style={{ border: '1px solid #eee', overflow: 'hidden' }}>
      <div 
        style={{ 
          height: '160px', 
          backgroundColor: '#e0e0e0', 
          animation: 'pulse 1.5s infinite ease-in-out',
          position: 'relative' 
        }} 
      />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '2px', backgroundColor: '#e0e0e0', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ height: '18px', width: '70%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
        <div style={{ height: '12px', width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: '12px', width: '80%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: '14px', width: '40%', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
          <div style={{ height: '22px', width: '30%', backgroundColor: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ height: '32px', width: '80px', backgroundColor: '#e0e0e0', borderRadius: '20px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
      </div>
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

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="modern-menu-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

export default ProductSkeleton;
