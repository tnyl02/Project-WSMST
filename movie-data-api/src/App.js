import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar'; // อย่าลืม Import Sidebar
import Home from './pages/Home';
import ApiDocs from './pages/ApiDocs';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieExplorer from './pages/MovieExplorer';
import './App.css'; // ต้องมีไฟล์ CSS นี้เพื่อจัด Flexbox

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="app-container">
        {/* 1. Navbar อยู่บนสุด (อันเดียวพอครับ) */}
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

        <div className="main-layout">
          {/* 2. ถ้า Login แล้ว ให้ Sidebar ปรากฏตัวทางซ้าย */}
          {isLoggedIn && <Sidebar />}

          {/* 3. พื้นที่แสดงเนื้อหาหลักทางขวา */}
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/docs" element={<ApiDocs />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explorer" element={<MovieExplorer />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;