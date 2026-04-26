import React, { useState, useEffect } from 'react';
import StatCard from '../components/Dashboard/StatCard';
import ApiKeyBox from '../components/ApiManagement/ApiKeyBox';
import UsageChart from '../components/Dashboard/UsageChart';
import RateLimitProgress from '../components/Dashboard/RateLimitProgress';
import EndpointPieChart from '../components/Dashboard/EndpointPieChart';
import '../styles/Dashboard.css';

// ข้อมูลจำลอง — ลบออกเมื่อ Backend พร้อม
const MOCK_DATA = {
  requestsToday: 1240,
  growth: 8.3,
  quotaUsed: 1240,
  quotaMax: 5000,
  planName: 'Medium Pack',
  activeKeys: 2,
  latestKey: 'mov_a1b2c3••••',
  errorsToday: 3,
  usageHistory: [
    { label: 'Mon', value: 800 },
    { label: 'Tue', value: 1200 },
    { label: 'Wed', value: 950 },
    { label: 'Thu', value: 1100 },
    { label: 'Fri', value: 1400 },
    { label: 'Sat', value: 900 },
    { label: 'Sun', value: 1240 },
  ],
  rateLimits: [
    { label: 'Per minute',  used: 45,  max: 60  },
    { label: 'Per hour',    used: 820, max: 1000 },
    { label: 'Per day',     used: 1240,max: 5000 },
  ],
  endpointBreakdown: [
    { label: '/movies',        value: 60 },
    { label: '/movies/:id',    value: 28 },
    { label: '/search',        value: 12 },
  ],
};

const USE_MOCK = true; // ← เปลี่ยนเป็น false เมื่อ Backend พร้อม

const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          // จำลอง delay เหมือน API จริง
          await new Promise(r => setTimeout(r, 600));
          setData(MOCK_DATA);
        } else {
          const res = await fetch('/api/dashboard');
          if (!res.ok) throw new Error(`Error ${res.status}`);
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถเชื่อมต่อ Backend ได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">กำลังเตรียมข้อมูล Dashboard...</p>
      </div>
    );
  }

  // แสดง error แทนหน้าว่าง
  if (error) {
    return (
      <div className="loading-container">
        <p className="loading-text" style={{ color: '#e74c3c' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="date-text">Sunday, 19 April 2026</p>
      </header>

      <div className="stats-grid">
        <StatCard
          title="Requests today"
          value={data.requestsToday.toLocaleString()}
          subValue={`↑ ${data.growth}% from yesterday`}
        />
        <StatCard
          title="Quota used"
          value={`${data.quotaUsed.toLocaleString()} / ${data.quotaMax.toLocaleString()}`}
          subValue={data.planName}
        />
        <StatCard
          title="Active API key"
          value={data.activeKeys}
          subValue={data.latestKey}
        />
        <StatCard
          title="Error 429 today"
          value={data.errorsToday}
          subValue="System Status: Ready"
        />
      </div>

      <ApiKeyBox />

      <div className="charts-main-grid">
        <div className="chart-card">
          <h3>API calls</h3>
          <UsageChart chartData={data.usageHistory} />
        </div>
        <div className="chart-card">
          <h3>Rate Limit Status</h3>
          <RateLimitProgress limits={data.rateLimits} />
        </div>
      </div>

      <div className="bottom-grid">
        <div className="chart-card pie-section">
          <h3>Endpoint breakdown</h3>
          <EndpointPieChart breakdown={data.endpointBreakdown} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;