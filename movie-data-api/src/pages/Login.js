import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import axios from 'axios';
import '../styles/Auth.css';

const mockUsers = [
  { identifier: "admin@movie.com", password: "password123", role: "admin", token: "mock_admin_token" },
  { identifier: "user@movie.com",  password: "user1234",    role: "user",  token: "mock_user_token" },
];

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // หา user ที่ตรงกัน
      const matchedUser = mockUsers.find(
        (u) => u.identifier === formData.identifier && u.password === formData.password
      );

      if (matchedUser) {
        toast.success("ยินดีต้อนรับ! เข้าสู่ระบบสำเร็จ", {
          position: "top-right",
          autoClose: 2000,
        });

        // เก็บ token และ role ลง localStorage
        localStorage.setItem('token', matchedUser.token);
        localStorage.setItem('role', matchedUser.role);
        setIsLoggedIn(true);

        // Redirect ตาม role
        setTimeout(() => {
          if (matchedUser.role === "admin") {
            navigate('/admin/dashboard');  // หน้า Admin
          } else {
            navigate('/dashboard');        // หน้า User ทั่วไป
          }
        }, 1000);

      } else {
        toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง!");
      }
    } catch (error) {
      toast.warn("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
            <label>Email / Username</label>
            <input 
              type="text" 
              name="identifier" 
              value={formData.identifier}
              onChange={handleChange}
              placeholder="admin@movie.com"
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

          <button type="submit" className="btn-auth-submit">
            Sign in <span className="arrow">⟶</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;