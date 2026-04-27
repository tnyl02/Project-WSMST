import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar'; 
import Home from './pages/Home';
import ApiDocs from './pages/ApiDocs';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieExplorer from './pages/MovieExplorer';
import ApiManagement from './pages/ApiManagement';
import UsageLogs from './pages/UsageLogs';
import MyProfile from './pages/MyProfile';
import Subscription from './pages/Subscription';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import MovieManagement from './pages/admin/MovieManagement';
import MovieEdit from './pages/admin/MovieEdit';

import { INITIAL_MOVIES } from './data/movies';   // ← import จาก data/

import './App.css'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = (val) => {
    setIsLoggedIn(val);
    localStorage.setItem('isLoggedIn', val);
  };

  const [currentPlan, setCurrentPlan] = useState(() => {
    return localStorage.getItem('currentPlan') || 'starter';
  });

  // ===== Movie State =====
  const [movies, setMovies] = useState(INITIAL_MOVIES);  // ← ใช้จาก data/

  const handleSaveMovie = (updated) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const handleDeleteMovie = (id) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Router>
      <div className="app-container">
        <ToastContainer position="top-right" autoClose={3000} />
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={handleLogin} currentPlan={currentPlan} />
        <div className="main-layout">
          {isLoggedIn && <Sidebar />}
          <main className={`content-area ${!isLoggedIn ? 'full-width' : ''}`}>
            <Routes>

              {/* Public Routes */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login setIsLoggedIn={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/docs"     element={<ApiDocs />} />

              {/* User Routes */}
              <Route path="/dashboard"      element={<Dashboard />} />
              <Route path="/explorer"       element={<MovieExplorer />} />
              <Route path="/api-management" element={<ApiManagement />} />
              <Route path="/logs"           element={<UsageLogs />} />
              <Route path="/profile"        element={<MyProfile />} />
              <Route path="/subscription"   element={<Subscription setCurrentPlan={setCurrentPlan} />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard"
                element={<AdminRoute><AdminDashboard /></AdminRoute>}
              />
              <Route path="/admin/user-management"
                element={<AdminRoute><UserManagement /></AdminRoute>}
              />

              {/* Movie Management */}
              <Route path="/admin/movie-management"
                element={
                  <AdminRoute>
                    <MovieManagement
                      movies={movies}
                      onDelete={handleDeleteMovie}
                    />
                  </AdminRoute>
                }
              />

              {/* Movie Edit */}
              <Route path="/admin/movie-edit/:id"
                element={
                  <AdminRoute>
                    <MovieEdit
                      movies={movies}
                      onSave={handleSaveMovie}
                    />
                  </AdminRoute>
                }
              />

            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;