import React, { useState, useEffect } from 'react';
import StatCard from '../components/Dashboard/StatCard';
import ApiKeyBox from '../components/ApiManagement/ApiKeyBox';
import UsageChart from '../components/Dashboard/UsageChart';
import RateLimitProgress from '../components/Dashboard/RateLimitProgress';
import '../styles/Dashboard.css';

const QUOTA_BY_PLAN  = { free: 1000, medium: 50000, premium: Infinity };
const RATEMIN_BY_PLAN = { free: 10,   medium: 50,    premium: 100 };

const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [plan, setPlan]       = useState('free');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // วันที่จริง ไม่ hardcode
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, profileRes] = await Promise.all([
          fetch('/api/dashboard/stats', { headers }),
          fetch('/api/user/profile',    { headers }),
        ]);

        if (!statsRes.ok) throw new Error(`Error ${statsRes.status}`);
        const stats   = await statsRes.json();
        const profile = profileRes.ok ? await profileRes.json() : null;

        setData(stats);
        if (profile?.plan) setPlan(profile.plan);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Unable to connect to the backend or access denied.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Loading Dashboard data...</p>
    </div>
  );

  if (error) return (
    <div className="loading-container">
      <p className="loading-text" style={{ color: '#e74c3c' }}>{error}</p>
    </div>
  );

  const quotaMax   = QUOTA_BY_PLAN[plan]   ?? 1000;
  const perMin     = RATEMIN_BY_PLAN[plan] ?? 10;
  const quotaUsed  = data?.today_usage ?? 0;
  const quotaText  = quotaMax === Infinity
    ? `${quotaUsed.toLocaleString()} / ∞`
    : `${quotaUsed.toLocaleString()} / ${quotaMax.toLocaleString()}`;
  const planLabel  = plan.charAt(0).toUpperCase() + plan.slice(1);

  const minute_usage  = data?.minute_usage  ?? 0;
  const monthly_usage = data?.monthly_usage ?? 0;

  const rateLimits = [
  { 
    label: 'Per minute', 
    used: Math.min(minute_usage, perMin), 
    max: perMin 
  },
  {
    label: 'Per month',
    used: monthly_usage,
    // แก้ไขบรรทัดนี้: ส่ง Infinity ไปตรงๆ เลย
    max: quotaMax, 
  },
];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="date-text">{today}</p>
      </header>

      <div className="stats-grid">
        <StatCard
          title="Requests today"
          value={quotaUsed.toLocaleString()}
          subValue={`${data?.today_errors ?? 0} errors (429) today`}
        />
        <StatCard
          title="Quota used"
          value={quotaText}
          subValue={`Plan: ${planLabel}`}
        />
        <StatCard
          title="Active API key"
          value={data?.activeKeys ?? 1}
          subValue="Key is active"
        />
        <StatCard
          title="Error 429 today"
          value={data?.today_errors ?? 0}
          subValue="System Status: Ready"
        />
      </div>

      <ApiKeyBox />

      <div className="charts-main-grid">
        <div className="chart-card">
          <h3>API calls</h3>
          <UsageChart chartData={data?.graph_data ?? []} />
        </div>
        <div className="chart-card">
          <h3>Rate Limit Status</h3>
          <RateLimitProgress limits={rateLimits} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;