import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; // อย่าลืมสร้างไฟล์ CSS สำหรับหน้า Auth ด้วยนะครับ

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate(); // สร้างตัวแปรสำหรับสั่งเปลี่ยนหน้า
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true); // เปลี่ยนสถานะเป็นล็อกอินแล้ว
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to scope_api</h1>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <Link to="/login" className="tab-item active">Log in</Link>
          <Link to="/register" className="tab-item">Register</Link>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email / Username</label>
            <input 
              type="text" 
              name="identifier" 
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              onChange={handleChange}
              required 
            />
          </div>

          <button type="submit" className="btn-auth-submit">
            Sign in <span className="arrow">⟶</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;