import React from 'react';

export const DashboardCard = ({ icon, trendType, trendValue, value, label, colorClass }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-top">
        <div className={`stats-card-icon ${colorClass || 'red'}`}>
          <i className={icon}></i>
        </div>
        {trendValue && (
          <div className={`stats-card-trend ${trendType === 'down' ? 'down' : 'up'}`}>
            <i className={`fa-solid ${trendType === 'down' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="stats-card-value">{value}</div>
      <div className="stats-card-label">{label}</div>
    </div>
  );
};

const DashboardCards = ({ stats }) => {
  const defaultStats = [
    { icon: 'fa-solid fa-basket-shopping', trendValue: '12.5%', trendType: 'up', value: '520', label: 'Total Orders', colorClass: 'red' },
    { icon: 'fa-solid fa-pizza-slice', trendValue: '8.3%', trendType: 'up', value: '24', label: "Today's Orders", colorClass: 'orange' },
    { icon: 'fa-solid fa-indian-rupee-sign', trendValue: '18.2%', trendType: 'up', value: 'Rs. 48,200', label: 'Revenue', colorClass: 'teal' },
    { icon: 'fa-solid fa-user-group', trendValue: '4.1%', trendType: 'up', value: '320', label: 'Customers', colorClass: 'blue' },
  ];

  const cardsToRender = stats || defaultStats;

  return (
    <div className="stats-cards-grid">
      {cardsToRender.map((c, i) => (
        <DashboardCard 
          key={i}
          icon={c.icon}
          trendType={c.trendType}
          trendValue={c.trendValue}
          value={c.value}
          label={c.label}
          colorClass={c.colorClass}
        />
      ))}
    </div>
  );
};

export default DashboardCards;
