import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../styles/AdminDashboard.css';
const topUsers = [
  { rank: 1, name: 'JohnDoe',    key: 'mov_a1b2c3', plan: 'Premium', requests: 1240, status: 'Active' },
  { rank: 2, name: 'FilmMaster', key: 'mov_d4e5f6', plan: 'Premium', requests: 980,  status: 'Active' },
  { rank: 3, name: 'CineFan99',  key: 'mov_g7h8i9', plan: 'Medium',  requests: 300,  status: 'Active' },
  { rank: 4, name: 'MovieBuff',  key: 'mov_j1k2l3', plan: 'Medium',  requests: 250,  status: 'Active' },
  { rank: 5, name: 'TestUser',   key: 'mov_m4n5o6', plan: 'Free',    requests: 100,  status: 'Limit'  },
];

const planBadge   = { Premium: 'adm-badge-premium', Medium: 'adm-badge-medium', Free: 'adm-badge-free' };
const statusBadge = { Active: 'adm-badge-active', Limit: 'adm-badge-limit' };

const AdminDashboard = () => {
  const lineRef    = useRef(null);
  const donutRef   = useRef(null);
  const lineChart  = useRef(null);
  const donutChart = useRef(null);

  useEffect(() => {
    lineChart.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: ['Apr 19','Apr 20','Apr 21','Apr 22','Apr 23','Apr 24','Apr 25'],
        datasets: [{
          label: 'Requests',
          data: [9800, 10200, 11000, 9500, 13100, 11800, 12540],
          borderColor: '#378ADD',
          backgroundColor: 'rgba(55,138,221,0.08)',
          borderWidth: 2,
          pointRadius: 3,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 11 } } },
          y: { ticks: { font: { size: 11 }, callback: v => (v/1000).toFixed(1)+'k' } }
        }
      }
    });

    donutChart.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Free', 'Medium', 'Premium'],
        datasets: [{
          data: [60, 32, 8],
          backgroundColor: ['#888780', '#378ADD', '#534AB7'],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: false,
        cutout: '68%',
        plugins: { legend: { display: false } }
      }
    });

    return () => {
      lineChart.current?.destroy();
      donutChart.current?.destroy();
    };
  }, []);

  return (
    <div className="adm-page">

      <p className="adm-section-label">System Overview</p>
      <div className="adm-stat-grid">
        <div className="adm-stat-card req">
          <div className="adm-stat-label">Requests today</div>
          <div className="adm-stat-num">12,540</div>
          <div className="adm-stat-sub">+8.3% from yesterday</div>
        </div>
        <div className="adm-stat-card usr">
          <div className="adm-stat-label">Total users</div>
          <div className="adm-stat-num">120</div>
          <div className="adm-stat-sub">4 new this week</div>
        </div>
        <div className="adm-stat-card mov">
          <div className="adm-stat-label">Movies</div>
          <div className="adm-stat-num">97</div>
          <div className="adm-stat-sub">Last added 2h ago</div>
        </div>
      </div>

      <div className="adm-panel-full">
        <p className="adm-section-label">Top 5 Users — API usage today</p>
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th><th>Username</th><th>API Key</th>
              <th>Plan</th><th>Requests</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map(u => (
              <tr key={u.rank}>
                <td className="adm-rank">{u.rank}</td>
                <td>{u.name}</td>
                <td className="adm-mono">{u.key}</td>
                <td><span className={`adm-badge ${planBadge[u.plan]}`}>{u.plan}</span></td>
                <td className="adm-mono adm-right">{u.requests.toLocaleString()}</td>
                <td className="adm-right"><span className={`adm-badge ${statusBadge[u.status]}`}>{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-panels">
        <div className="adm-panel">
          <p className="adm-section-label">Requests — last 7 days</p>
          <div className="adm-chart-wrap">
            <canvas ref={lineRef}></canvas>
          </div>
        </div>
        <div className="adm-panel">
          <p className="adm-section-label">Subscription Overview</p>
          <div className="adm-donut-wrap">
            <canvas ref={donutRef} width="120" height="120"></canvas>
            <div className="adm-legend-list">
              {[['#888780','Free',60],['#378ADD','Medium',32],['#534AB7','Premium',8]].map(([c,l,v]) => (
                <div key={l} className="adm-legend-item">
                  <span className="adm-legend-label">
                    <span className="adm-legend-dot" style={{ background: c }}></span>{l}
                  </span>
                  <span className="adm-legend-val">{v}</span>
                </div>
              ))}
              <div className="adm-total-line">Total <span>1,000</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;