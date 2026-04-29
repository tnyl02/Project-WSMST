import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "../styles/AdminDashboard.css";

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

const AdminDashboard = () => {
  const planChartRef = useRef(null);
  const planChart = useRef(null);

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
  const latestUsers = useMemo(
    () => [...users].sort((a, b) => b.id - a.id).slice(0, 5),
    [users]
  );

  useEffect(() => {
    if (!planChartRef.current) {
      return;
    }

    planChart.current?.destroy();

    planChart.current = new Chart(planChartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Free", "Medium", "Premium"],
        datasets: [
          {
            data: [planCounts.free, planCounts.medium, planCounts.premium],
            backgroundColor: ["#cbccce", "#598eff", "#ffb055"],
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

    return () => {
      planChart.current?.destroy();
    };
  }, [planCounts]);

  return (
    <div className="adm-page">
      <p className="adm-section-label">System Overview</p>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-stat-grid">
        <div className="adm-stat-card req">
          <div className="adm-stat-label">Requests today</div>
          <div className="adm-stat-num">
            {stats ? stats.total_requests_today.toLocaleString() : "-"}
          </div>
          <div className="adm-stat-sub">
            {loading ? "Loading dashboard..." : "From admin dashboard stats"}
          </div>
        </div>

        <div className="adm-stat-card usr">
          <div className="adm-stat-label">Total users</div>
          <div className="adm-stat-num">
            {stats ? stats.total_users.toLocaleString() : "-"}
          </div>
          <div className="adm-stat-sub">
            {users.length ? `${users.length} non-admin users in list` : "No user data"}
          </div>
        </div>

        <div className="adm-stat-card mov">
          <div className="adm-stat-label">Movies</div>
          <div className="adm-stat-num">
            {stats ? stats.total_movies.toLocaleString() : "-"}
          </div>
          <div className="adm-stat-sub">Total movies in database</div>
        </div>
      </div>

      <div className="adm-panel-full">
        <p className="adm-section-label">Latest Users</p>
        <table className="adm-table">
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Username</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {latestUsers.length > 0 ? (
              latestUsers.map((user) => (
                <tr key={user.id}>
                  {/* <td className="adm-mono">{user.id}</td> */}
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
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-panels">
        <div className="adm-panel adm-panel-wide">
          <p className="adm-section-label">Subscription Overview</p>
          <div className="adm-donut-wrap">
            <canvas ref={planChartRef} width="168" height="168"></canvas>
            <div className="adm-legend-list">
              {[
                ["#cbccce", "Free", planCounts.free],
                ["#598eff", "Medium", planCounts.medium],
                ["#ffb055", "Premium", planCounts.premium],

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
