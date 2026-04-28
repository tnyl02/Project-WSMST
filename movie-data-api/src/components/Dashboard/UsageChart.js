import React from 'react';

const CHART_HEIGHT = 150; // px ตรงกับ .bars-group height

const UsageChart = ({ chartData = [] }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count: 0,
    };
  });

  chartData.forEach(({ date, count }) => {
    const found = last7Days.find(d => d.date === date);
    if (found) found.count = count;
  });

  const maxCount = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <div className="usage-chart-container">
      <div className="bars-group">
        {last7Days.map((day, i) => {
          const barHeight = Math.max(Math.round((day.count / maxCount) * CHART_HEIGHT), day.count > 0 ? 4 : 0);
          return (
            <div key={i} className="bar-wrapper" title={`${day.date}: ${day.count} calls`}>
              <span style={{ fontSize: '11px', color: '#aaa' }}>
                {day.count > 0 ? day.count : ''}
              </span>
              <div
                className="bar"
                style={{
                  height: `${barHeight}px`,
                  background: day.count > 0 ? '#000000' : '#e0e0e0',
                  transition: 'height 0.4s ease',
                }}
              />
              <span>{day.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UsageChart;