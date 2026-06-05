import React from 'react';

const Filters = ({ activeFilter, onFilterChange, options }) => {
  return (
    <div className="filters-container flex-center gap-2" style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      marginBottom: '40px'
    }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`filter-btn ${activeFilter === opt.value ? 'active' : ''}`}
          onClick={() => onFilterChange(opt.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 24px',
            backgroundColor: activeFilter === opt.value ? '#C84B31' : '#FFFFFF',
            color: activeFilter === opt.value ? '#FFFFFF' : '#2B2A27',
            border: '1px solid #EAE6DB',
            fontWeight: '600',
            fontSize: '14px',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease'
          }}
        >
          {opt.icon && <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default Filters;
