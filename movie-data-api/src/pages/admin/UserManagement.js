import React, { useState, useRef, useEffect, useCallback } from "react";
import "./styles/UserManagement.css";

const PLAN_OPTIONS = ["premium", "medium", "free"];
const ROLE_OPTIONS = ["user", "admin"];

const PlanBadge = ({ plan }) => (
  <span className={`plan-badge plan-${plan?.toLowerCase()}`}>
    {plan?.charAt(0).toUpperCase() + plan?.slice(1)}
  </span>
);

const RoleBadge = ({ role }) => (
  <span className={`role-badge role-${role?.toLowerCase()}`}>
    {role?.charAt(0).toUpperCase() + role?.slice(1)}
  </span>
);

const ActionButtons = ({
  user,
  onUpdatePlan,
  onUpdateRole,
  onDelete,
  pendingAction,
}) => {
  const [openMenu, setOpenMenu] = useState(null);
  const ref = useRef(null);
  const isPending = pendingAction?.userId === user.id;

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete user "${user.username}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    await onDelete(user.id);
    setOpenMenu(null);
  };

  return (
    <div className="action-buttons" ref={ref}>
      <div className={`action-popover ${openMenu === "plan" ? "is-open" : ""}`}>
        <button
          className="action-btn"
          type="button"
          disabled={isPending}
          onClick={() => setOpenMenu((current) => (current === "plan" ? null : "plan"))}
        >
          Plan
        </button>
        {openMenu === "plan" && (
          <div className="action-menu">
            {PLAN_OPTIONS.map((plan) => (
              <button
                key={plan}
                type="button"
                className={`action-menu-item ${
                  user.plan?.toLowerCase() === plan ? "active" : ""
                }`}
                onClick={async () => {
                  await onUpdatePlan(user.id, plan);
                  setOpenMenu(null);
                }}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`action-popover ${openMenu === "role" ? "is-open" : ""}`}>
        <button
          className="action-btn"
          type="button"
          disabled={isPending}
          onClick={() => setOpenMenu((current) => (current === "role" ? null : "role"))}
        >
          Role
        </button>
        {openMenu === "role" && (
          <div className="action-menu">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                className={`action-menu-item ${
                  user.role?.toLowerCase() === role ? "active" : ""
                }`}
                onClick={async () => {
                  await onUpdateRole(user.id, role);
                  setOpenMenu(null);
                }}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="action-btn action-btn-danger"
        type="button"
        disabled={isPending}
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const showSuccess = (message) => {
    setSuccessMsg(message);
    window.clearTimeout(showSuccess.timerId);
    showSuccess.timerId = window.setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Missing token");
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch users: ${response.status}`);
      }

      setUsers(data.users || []);
    } catch (err) {
      setUsers([]);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserField = async (userId, field, value) => {
    const routeField = field === "role" ? "role" : "plan";
    const endpoint = `/api/admin/users/${userId}/${routeField}`;

    try {
      setPendingAction({ userId, field });
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Missing token");
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [routeField]: value }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Failed to update ${field}`);
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, [field]: value } : user
        )
      );
      showSuccess(`Updated ${field} successfully.`);
    } catch (err) {
      setError(err.message || `Unable to update ${field}.`);
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (userId) => {
    try {
      setPendingAction({ userId, field: "delete" });
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Missing token");
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      showSuccess("Deleted user successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete user.");
    } finally {
      setPendingAction(null);
    }
  };

  const filtered = users.filter((user) => {
    const keyword = search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.plan?.toLowerCase().includes(keyword) ||
      user.role?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="um-wrapper">
      <div className="um-header">
        <h1 className="um-title">Users Management</h1>

        <div className="um-search-box">
          <input
            className="um-search-input"
            type="text"
            placeholder="Search by username, email, plan, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {successMsg && <div className="um-success-msg">{successMsg}</div>}

      {error && (
        <div className="um-error-msg">
          <span>{error}</span>
          <button onClick={fetchUsers}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="um-loading">Loading users...</div>
      ) : (
        <div className="um-table-wrapper">
          <table className="um-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td>
                      <RoleBadge role={user.role} />
                    </td>
                    <td>
                      <ActionButtons
                        user={user}
                        onUpdatePlan={(id, value) =>
                          updateUserField(id, "plan", value)
                        }
                        onUpdateRole={(id, value) =>
                          updateUserField(id, "role", value)
                        }
                        onDelete={handleDelete}
                        pendingAction={pendingAction}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="um-empty">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
