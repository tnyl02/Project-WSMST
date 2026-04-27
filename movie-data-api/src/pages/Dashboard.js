import React, { useState, useEffect } from 'react';
import StatCard from '../components/Dashboard/StatCard';
import ApiKeyBox from '../components/ApiManagement/ApiKeyBox';
import UsageChart from '../components/Dashboard/UsageChart';
import RateLimitProgress from '../components/Dashboard/RateLimitProgress';
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
    { label: 'Per minute', used: 45, max: 60 },
    { label: 'Per hour', used: 820, max: 1000 },
    { label: 'Per day', used: 1240, max: 5000 },
  ],
  endpointBreakdown: [
    { label: '/movies', value: 60 },
    { label: '/movies/:id', value: 28 },
    { label: '/search', value: 12 },
  ],
};

const USE_MOCK = false; // ← เปลี่ยนเป็น false เมื่อ Backend พร้อม

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token'); // ดึง token มาจากตอน login

        // เรียกไปที่ /api/dashboard/stats (ผ่าน Proxy ที่เราตั้งไว้)
        const res = await fetch('/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // ส่ง Token ไปให้ Middleware ของ Go ตรวจสอบ
          }
        });

        if (!res.ok) {
          // ถ้า res.status เป็น 401 แปลว่า Token หมดอายุหรือไม่มีสิทธิ์
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        console.log("Data from Backend:", json); // ส่องดูชื่อตัวแปรในนี้เลย!
        setData(json);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError('Unable to connect to the backend or access denied.');
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
        <p className="loading-text">Loading Dashboard data...</p>
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
          // เปลี่ยนจาก requestsToday เป็น today_usage
          value={(data?.today_usage ?? 0).toLocaleString()}
          subValue={`↑ ${data?.growth ?? 0}% from yesterday`}
        />
        <StatCard
          title="Quota used"
          // โครงสร้างใหม่ไม่มี quotaMax มาให้ ต้องเช็คดีๆ นะครับ
          value={`${(data?.today_usage ?? 0).toLocaleString()} / 5000`}
          subValue={data?.planName ?? 'Standard Plan'}
        />
        <StatCard
          title="Active API key"
          value={data?.activeKeys ?? 1}
          subValue={data?.latestKey ?? 'Active'}
        />
        <StatCard
          title="Error 429 today"
          // เปลี่ยนจาก errorsToday เป็น today_errors
          value={data?.today_errors ?? 0}
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

    </div>
  );
};

export default Dashboard;