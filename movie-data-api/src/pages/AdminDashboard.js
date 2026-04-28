import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import '../styles/AdminDashboard.css';

const planBadge   = { premium: 'adm-badge-premium', medium: 'adm-badge-medium', free: 'adm-badge-free' };
const statusBadge = { active: 'adm-badge-active', limit: 'adm-badge-limit', block: 'adm-badge-limit' };

const AdminDashboard = () => {
  const lineRef    = useRef(null);
  const donutRef   = useRef(null);
  const lineChart  = useRef(null);
  const donutChart = useRef(null);

  const [stats, setStats]      = useState(null); // /api/dashboard/stats (graph)
  const [adminStats, setAdminStats] = useState(null); // /api/admin/dashboard/stats
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // graph data (user's own — ใช้ชั่วคราวจนกว่าจะมี admin graph)
    fetch('/api/dashboard/stats', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch(err => console.error('dashboard/stats:', err));

    // admin stats: total_users, total_movies, total_requests_today
    fetch('/api/admin/dashboard/stats', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAdminStats(data); })
      .catch(err => console.error('admin/dashboard/stats:', err));

    // top users from /api/admin/users (sort by requests desc, take 5)
    fetch('/api/admin/users', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.users) {
          const sorted = [...data.users]
            .sort((a, b) => (b.requests ?? 0) - (a.requests ?? 0))
            .slice(0, 5)
            .map((u, i) => ({ ...u, rank: i + 1 }));
          setTopUsers(sorted);
        }
      })
      .catch(err => console.error('admin/users:', err));
  }, []);

  // สร้าง chart เมื่อได้ข้อมูล
  useEffect(() => {
    if (!stats) return;

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

    return () => lineChart.current?.destroy();
  }, [stats]);

  // donut chart — ใช้ข้อมูลจาก /api/admin/users นับแยก plan
  useEffect(() => {
    if (!adminStats || !donutRef.current) return;

    const free    = adminStats.plan_free    ?? 0;
    const medium  = adminStats.plan_medium  ?? 0;
    const premium = adminStats.plan_premium ?? 0;

    donutChart.current?.destroy();
    donutChart.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Free', 'Medium', 'Premium'],
        datasets: [{
          data: [free, medium, premium],
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

    return () => donutChart.current?.destroy();
  }, [adminStats]);

  return (
    <div className="adm-page">

      <p className="adm-section-label">System Overview</p>
      <div className="adm-stat-grid">
        <div className="adm-stat-card req">
          <div className="adm-stat-label">Requests today</div>
          <div className="adm-stat-num">
            {adminStats ? adminStats.total_requests_today.toLocaleString() : '—'}
          </div>
          <div className="adm-stat-sub">
            {stats ? `${stats.today_errors} errors (429)` : 'loading...'}
          </div>
        </div>
        <div className="adm-stat-card usr">
          <div className="adm-stat-label">Total users</div>
          <div className="adm-stat-num">{adminStats ? adminStats.total_users : '—'}</div>
          <div className="adm-stat-sub">all registered users</div>
        </div>
        <div className="adm-stat-card mov">
          <div className="adm-stat-label">Movies</div>
          <div className="adm-stat-num">{adminStats ? adminStats.total_movies : '—'}</div>
          <div className="adm-stat-sub">in database</div>
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
            {topUsers.length > 0 ? topUsers.map(u => (
              <tr key={u.id}>
                <td className="adm-rank">{u.rank}</td>
                <td>{u.username}</td>
                <td className="adm-mono">{u.api_key || '—'}</td>
                <td><span className={`adm-badge ${planBadge[u.plan?.toLowerCase()] ?? ''}`}>{u.plan}</span></td>
                <td className="adm-mono adm-right">{(u.requests ?? 0).toLocaleString()}</td>
                <td className="adm-right"><span className={`adm-badge ${statusBadge[u.status?.toLowerCase()] ?? ''}`}>{u.status}</span></td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 16 }}>Loading...</td></tr>
            )}
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
              {[
                ['#888780', 'Free',    adminStats?.plan_free    ?? 0],
                ['#378ADD', 'Medium',  adminStats?.plan_medium  ?? 0],
                ['#534AB7', 'Premium', adminStats?.plan_premium ?? 0],
              ].map(([c, l, v]) => (
                <div key={l} className="adm-legend-item">
                  <span className="adm-legend-label">
                    <span className="adm-legend-dot" style={{ background: c }}></span>{l}
                  </span>
                  <span className="adm-legend-val">{v}</span>
                </div>
              ))}
              <div className="adm-total-line">Total <span>{adminStats ? adminStats.total_users : '—'}</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;