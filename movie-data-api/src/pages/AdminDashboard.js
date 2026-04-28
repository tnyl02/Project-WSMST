import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "../styles/AdminDashboard.css";

<<<<<<< HEAD
const planBadge   = { premium: 'adm-badge-premium', medium: 'adm-badge-medium', free: 'adm-badge-free' };
const statusBadge = { active: 'adm-badge-active', limit: 'adm-badge-limit', block: 'adm-badge-limit' };
=======
const planBadge = {
  premium: "adm-badge-premium",
  medium: "adm-badge-medium",
  free: "adm-badge-free",
};

const roleBadge = {
  admin: "adm-badge-admin",
  user: "adm-badge-user",
};

const normalizePlanCounts = (users) => {
  const counts = { free: 0, medium: 0, premium: 0 };

  users.forEach((user) => {
    const plan = String(user.plan || "free").toLowerCase();
    if (counts[plan] !== undefined) {
      counts[plan] += 1;
    }
  });

  return counts;
};

const normalizeRoleCounts = (users) => {
  const counts = { user: 0, admin: 0 };

  users.forEach((user) => {
    const role = String(user.role || "user").toLowerCase();
    if (counts[role] !== undefined) {
      counts[role] += 1;
    }
  });

  return counts;
};
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c

const AdminDashboard = () => {
  const planChartRef = useRef(null);
  const roleChartRef = useRef(null);
  const planChart = useRef(null);
  const roleChart = useRef(null);

<<<<<<< HEAD
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
=======
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Missing token");
        }

        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const statsData = await statsRes.json().catch(() => ({}));
        const usersData = await usersRes.json().catch(() => ({}));

        if (!statsRes.ok) {
          throw new Error(statsData.error || "Failed to load admin stats");
        }

        if (!usersRes.ok) {
          throw new Error(usersData.error || "Failed to load users");
        }

        if (isMounted) {
          setStats(statsData);
          setUsers(usersData.users || []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Unable to load admin dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const planCounts = useMemo(() => normalizePlanCounts(users), [users]);
  const roleCounts = useMemo(() => normalizeRoleCounts(users), [users]);
  const latestUsers = useMemo(
    () => [...users].sort((a, b) => b.id - a.id).slice(0, 5),
    [users]
  );

>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
  useEffect(() => {
    if (!planChartRef.current || !roleChartRef.current) {
      return;
    }

<<<<<<< HEAD
    const graphLabels = stats.graph_data.map(d =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const graphValues = stats.graph_data.map(d => d.count);
=======
    planChart.current?.destroy();
    roleChart.current?.destroy();
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c

    planChart.current = new Chart(planChartRef.current, {
      type: "doughnut",
      data: {
<<<<<<< HEAD
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
=======
        labels: ["Free", "Medium", "Premium"],
        datasets: [
          {
            data: [planCounts.free, planCounts.medium, planCounts.premium],
            backgroundColor: ["#888780", "#378ADD", "#534AB7"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
      },
      options: {
        responsive: false,
        cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });

    roleChart.current = new Chart(roleChartRef.current, {
      type: "doughnut",
      data: {
        labels: ["User", "Admin"],
        datasets: [
          {
            data: [roleCounts.user, roleCounts.admin],
            backgroundColor: ["#1D9E75", "#7C3AED"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: false,
        cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });

<<<<<<< HEAD
    return () => donutChart.current?.destroy();
  }, [adminStats]);
=======
    return () => {
      planChart.current?.destroy();
      roleChart.current?.destroy();
    };
  }, [planCounts, roleCounts]);
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c

  return (
    <div className="adm-page">
      <p className="adm-section-label">System Overview</p>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-stat-grid">
        <div className="adm-stat-card req">
          <div className="adm-stat-label">Requests today</div>
          <div className="adm-stat-num">
<<<<<<< HEAD
            {adminStats ? adminStats.total_requests_today.toLocaleString() : '—'}
=======
            {stats ? stats.total_requests_today.toLocaleString() : "-"}
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
          </div>
          <div className="adm-stat-sub">
            {loading ? "Loading dashboard..." : "From admin dashboard stats"}
          </div>
        </div>
<<<<<<< HEAD
        <div className="adm-stat-card usr">
          <div className="adm-stat-label">Total users</div>
          <div className="adm-stat-num">{adminStats ? adminStats.total_users : '—'}</div>
          <div className="adm-stat-sub">all registered users</div>
=======

        <div className="adm-stat-card usr">
          <div className="adm-stat-label">Total users</div>
          <div className="adm-stat-num">
            {stats ? stats.total_users.toLocaleString() : "-"}
          </div>
          <div className="adm-stat-sub">
            {users.length ? `${users.length} non-admin users in list` : "No user data"}
          </div>
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
        </div>

        <div className="adm-stat-card mov">
          <div className="adm-stat-label">Movies</div>
<<<<<<< HEAD
          <div className="adm-stat-num">{adminStats ? adminStats.total_movies : '—'}</div>
          <div className="adm-stat-sub">in database</div>
=======
          <div className="adm-stat-num">
            {stats ? stats.total_movies.toLocaleString() : "-"}
          </div>
          <div className="adm-stat-sub">Total movies in database</div>
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
        </div>
      </div>

      <div className="adm-panel-full">
        <p className="adm-section-label">Latest Users</p>
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
<<<<<<< HEAD
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
=======
            {latestUsers.length > 0 ? (
              latestUsers.map((user) => (
                <tr key={user.id}>
                  <td className="adm-mono">{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`adm-badge ${
                        planBadge[String(user.plan || "free").toLowerCase()]
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`adm-badge ${
                        roleBadge[String(user.role || "user").toLowerCase()]
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="adm-empty-cell">
                  {loading ? "Loading users..." : "No users found"}
                </td>
              </tr>
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-panels">
        <div className="adm-panel">
          <p className="adm-section-label">Subscription Overview</p>
          <div className="adm-donut-wrap">
            <canvas ref={planChartRef} width="120" height="120"></canvas>
            <div className="adm-legend-list">
              {[
<<<<<<< HEAD
                ['#888780', 'Free',    adminStats?.plan_free    ?? 0],
                ['#378ADD', 'Medium',  adminStats?.plan_medium  ?? 0],
                ['#534AB7', 'Premium', adminStats?.plan_premium ?? 0],
              ].map(([c, l, v]) => (
                <div key={l} className="adm-legend-item">
=======
                ["#888780", "Free", planCounts.free],
                ["#378ADD", "Medium", planCounts.medium],
                ["#534AB7", "Premium", planCounts.premium],
              ].map(([color, label, value]) => (
                <div key={label} className="adm-legend-item">
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
                  <span className="adm-legend-label">
                    <span
                      className="adm-legend-dot"
                      style={{ background: color }}
                    ></span>
                    {label}
                  </span>
                  <span className="adm-legend-val">{value}</span>
                </div>
              ))}
<<<<<<< HEAD
              <div className="adm-total-line">Total <span>{adminStats ? adminStats.total_users : '—'}</span></div>
=======
              <div className="adm-total-line">
                Total <span>{users.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="adm-panel">
          <p className="adm-section-label">Role Overview</p>
          <div className="adm-donut-wrap">
            <canvas ref={roleChartRef} width="120" height="120"></canvas>
            <div className="adm-legend-list">
              {[
                ["#1D9E75", "User", roleCounts.user],
                ["#7C3AED", "Admin", roleCounts.admin],
              ].map(([color, label, value]) => (
                <div key={label} className="adm-legend-item">
                  <span className="adm-legend-label">
                    <span
                      className="adm-legend-dot"
                      style={{ background: color }}
                    ></span>
                    {label}
                  </span>
                  <span className="adm-legend-val">{value}</span>
                </div>
              ))}
              <div className="adm-total-line">
                Total <span>{users.length}</span>
              </div>
>>>>>>> a9e390118619b5a6e21a5820d864f362cccbc09c
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
