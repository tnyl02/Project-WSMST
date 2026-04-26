import React from 'react';

const UsageChart = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="usage-chart-container">
      <div className="bars-group">
        {/* กราฟแท่งจำลอง */}
        {[40, 70, 55, 45, 60, 30, 65].map((height, i) => (
          <div key={i} className="bar-wrapper">
            <div className="bar" style={{ height: `${height}%` }}></div>
            <span>{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageChart;