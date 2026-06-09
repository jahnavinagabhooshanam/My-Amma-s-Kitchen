import React from 'react';

export const BarChart = ({ title, data }) => {
  const defaultData = [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 70 },
    { label: 'Wed', value: 60 },
    { label: 'Thu', value: 90 },
    { label: 'Fri', value: 85 },
    { label: 'Sat', value: 120 },
    { label: 'Sun', value: 110 }
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="premium-card">
      <div className="premium-card-header">
        <div className="premium-card-title">
          <i className="fa-solid fa-chart-bar"></i>
          <h3>{title || 'Weekly Sales Activity'}</h3>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '220px', padding: '0 10px', position: 'relative', borderBottom: '1px solid #EAE6DB' }}>
          {chartData.map((d, i) => {
            const heightPct = maxValue ? (d.value / maxValue) * 80 : 0;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '10%', gap: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary-color)' }}>{d.value}</div>
                <div style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: 'linear-gradient(to top, var(--theme-color-light) 0%, var(--theme-color) 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.8s ease-in-out',
                  position: 'relative'
                }} className="bar-hover-effect" />
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7E7A6B', textTransform: 'uppercase' }}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Charts = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <BarChart title="Sales Growth Metrics" />
    </div>
  );
};

export default Charts;
