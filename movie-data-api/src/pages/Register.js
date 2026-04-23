import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css'; // อย่าลืมสร้างไฟล์ CSS สำหรับหน้า Auth ด้วยนะครับ

const Register = () => {
  // สร้าง State สำหรับเก็บค่าจากช่อง Input
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", formData);
    // ตรงนี้เอาไว้ใส่ Logic ส่งข้อมูลไป API
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to scope_api</h1>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <Link to="/login" className="tab-item">Log in</Link>
          <Link to="/register" className="tab-item active">Register</Link>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full name</label>
            <input 
              type="text" name="fullName" 
             
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" name="email" 
             
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" name="username" 
             
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" name="password" 
               
              onChange={handleChange} 
            />
          </div>

          <div className="input-group">
            <label>Confirm password</label>
            <input 
              type="password" name="confirmPassword" 
              
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="btn-auth-submit">
            Create account <span className="arrow">⟶</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;