import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/Auth.css';

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        Email: formData.identifier,
        password: formData.password,
      });

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('plan', user.plan);
      localStorage.setItem('username', user.username);

      setIsLoggedIn(true);

      toast.success('ยินดีต้อนรับ! เข้าสู่ระบบสำเร็จ', {
        position: 'top-right',
        autoClose: 2000,
      });

      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);

    } catch (error) {
      const msg = error.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to scope_api</h1>

        <div className="auth-tabs">
          <Link to="/login" className="tab-item active">Log in</Link>
          <Link to="/register" className="tab-item">Register</Link>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : <> Sign in <span className="arrow">⟶</span> </>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;