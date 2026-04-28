import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../styles/Auth.css';

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        email: formData.identifier,
        password: formData.password,
      });

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('plan', user.plan);
      localStorage.setItem('username', user.username);

      setIsLoggedIn(true);

      toast.success('Welcome! Login successful.', {
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
      const msg = error.response?.data?.error || 'Failed to connect. Please try again.';
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
            {/* สร้าง wrapper เพื่อคุมตำแหน่ง */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"} // เปลี่ยนตรงนี้
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{ width: '100%', paddingRight: '45px' }} // เว้นที่ด้านขวาให้ปุ่ม
              />

              {/* วางปุ่มไอคอนไว้ในกล่อง */}
              <button
                type="button" // สำคัญมาก: ต้องระบุว่าเป็น button ไม่ให้มันไป submit form
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : <> Sign in <span className="arrow">⟶</span> </>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;