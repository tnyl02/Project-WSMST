// src/components/Dashboard/EndpointPieChart.jsx
const EndpointPieChart = ({ breakdown }) => {
  const colors = ['#ff8a80', '#4fc3f7', '#7986cb'];

  return (
    <div className="pie-chart-container">
      <div className="pie-placeholder">
        <div className="pie-inner"></div>
      </div>
      <div className="pie-legend">
        {breakdown.map((item, i) => (
          <div key={item.label} className="dash-legend-item">  {/* ✅ เปลี่ยนตรงนี้ */}
            <span className="dash-dot" style={{ background: colors[i % colors.length] }}></span>
            <span className="dash-label">{item.label}</span>
            <span className="dash-val">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EndpointPieChart;