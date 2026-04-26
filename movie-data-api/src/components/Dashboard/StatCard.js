const StatCard = ({ title, value, subValue }) => (
  <div className="stat-card">
    <span className="stat-title">{title}</span>
    <h2 className="stat-value">{value || 0}</h2>
    <span className="stat-sub">{subValue}</span>
  </div>
);
export default StatCard;