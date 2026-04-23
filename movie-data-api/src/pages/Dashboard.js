import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar'; // Import มาใช้
import '../styles/Dashboard.css'; // Import CSS สำหรับ Dashboard

const Dashboard = () => {
  const [apiKey, setApiKey] = useState("sk-movie-••••••••••••••••");
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleKey = () => setIsRevealed(!isRevealed);

  const stats = [
    { title: "Total Requests", value: "1,284", unit: "calls", color: "#007bff" },
    { title: "Avg. Latency", value: "142", unit: "ms", color: "#10b981" },
    { title: "Error Rate", value: "0.2", unit: "%", color: "#ef4444" },
    { title: "Quota Used", value: "64", unit: "%", color: "#f59e0b" }
  ];

 return (
    <div className="dashboard-container">

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>Dashboard Overview</h2>
          <p>Manage your API usage and credentials.</p>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <span className="stat-label">{stat.title}</span>
              <div className="stat-value-group">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-unit">{stat.unit}</span>
              </div>
              <div className="stat-progress-bg">
                <div 
                  className="stat-progress-bar" 
                  style={{ width: stat.title === "Quota Used" ? "64%" : "100%", backgroundColor: stat.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* API Key Section */}
        <section className="api-key-section">
          <h3>Your API Key</h3>
          <div className="api-key-box">
            <code className="api-key-text">
              {isRevealed ? "sk-movie-data-api-v1-9921-hidden-key" : apiKey}
            </code>
            <div className="api-key-actions">
              <button className="btn-reveal" onClick={toggleKey}>
                {isRevealed ? "Hide" : "Reveal"}
              </button>
              <button className="btn-copy" onClick={() => navigator.clipboard.writeText("sk-movie-data-api-v1-9921-hidden-key")}>
                Copy
              </button>
            </div>
          </div>
          <p className="api-hint">Keep this key secret! Do not share it in public repositories.</p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;