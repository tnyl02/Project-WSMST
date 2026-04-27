import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import '../styles/AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// TODO: ต้องเพิ่ม admin endpoint ใน backend ถึงจะดึงข้อมูลจริงได้
// เช่น GET /api/admin/stats → { total_users, requests_today, top_users, plan_breakdown }
const MOCK_TOP_USERS = [
  { rank: 1, name: 'JohnDoe',    key: 'mov_a1b2c3', plan: 'Premium', requests: 1240, status: 'Active' },
  { rank: 2, name: 'FilmMaster', key: 'mov_d4e5f6', plan: 'Premium', requests: 980,  status: 'Active' },
  { rank: 3, name: 'CineFan99',  key: 'mov_g7h8i9', plan: 'Medium',  requests: 300,  status: 'Active' },
  { rank: 4, name: 'MovieBuff',  key: 'mov_j1k2l3', plan: 'Medium',  requests: 250,  status: 'Active' },
  { rank: 5, name: 'TestUser',   key: 'mov_m4n5o6', plan: 'Free',    requests: 100,  status: 'Limit'  },
];

const MOCK_PLAN_DATA = { Free: 60, Medium: 32, Premium: 8 };

const planBadge   = { Premium: 'adm-badge-premium', Medium: 'adm-badge-medium', Free: 'adm-badge-free' };
const statusBadge = { Active: 'adm-badge-active', Limit: 'adm-badge-limit' };

const AdminDashboard = () => {
  const lineRef    = useRef(null);
  const donutRef   = useRef(null);
  const lineChart  = useRef(null);
  const donutChart = useRef(null);

  // ข้อมูลจริงจาก backend (/api/dashboard/stats)
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('AdminDashboard fetch error:', err);
      }
    };

    fetchStats();
  }, []);

  // สร้าง chart เมื่อได้ stats จาก API แล้ว
  useEffect(() => {
    if (!stats) return;

    // graph_data จาก backend: [{ date: "2026-04-20", count: 320 }, ...]
    const graphLabels = stats.graph_data.map(d =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const graphValues = stats.graph_data.map(d => d.count);

    lineChart.current?.destroy();
    lineChart.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: graphLabels,
        datasets: [{
          label: 'Requests',
          data: graphValues,
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
          y: { ticks: { font: { size: 11 }, callback: v => v >= 1000 ? (v/1000).toFixed(1)+'k' : v } }
        }
      }
    });

    // donut ยังใช้ mock จนกว่าจะมี admin endpoint
    donutChart.current?.destroy();
    donutChart.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Free', 'Medium', 'Premium'],
        datasets: [{
          data: [MOCK_PLAN_DATA.Free, MOCK_PLAN_DATA.Medium, MOCK_PLAN_DATA.Premium],
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
  }, [stats]);

  return (
    <div className="adm-page">

      <p className="adm-section-label">System Overview</p>
      <div className="adm-stat-grid">
        <div className="adm-stat-card req">
          <div className="adm-stat-label">Requests today</div>
          <div className="adm-stat-num">
            {stats ? stats.today_usage.toLocaleString() : '—'}
          </div>
          <div className="adm-stat-sub">
            {stats ? `${stats.today_errors} errors (429)` : 'loading...'}
          </div>
        </div>
        {/* TODO: ต้องมี admin endpoint ถึงจะแสดงข้อมูลจริงได้ */}
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

      {/* TODO: ต้องมี admin endpoint สำหรับ top users */}
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
            {MOCK_TOP_USERS.map(u => (
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
            {!stats && <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>loading...</p>}
            <canvas ref={lineRef}></canvas>
          </div>
        </div>
        <div className="adm-panel">
          <p className="adm-section-label">Subscription Overview</p>
          <div className="adm-donut-wrap">
            <canvas ref={donutRef} width="120" height="120"></canvas>
            <div className="adm-legend-list">
              {[['#888780','Free', MOCK_PLAN_DATA.Free], ['#378ADD','Medium', MOCK_PLAN_DATA.Medium], ['#534AB7','Premium', MOCK_PLAN_DATA.Premium]].map(([c,l,v]) => (
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