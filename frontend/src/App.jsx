import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './api/client';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

function Protected({ authed, children }) {
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (mounted) setUser(data);
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const authed = !!user;

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login onAuthed={setUser} />} />
      <Route path="/register" element={<Register onAuthed={setUser} />} />
      <Route
        path="/dashboard"
        element={
          <Protected authed={authed}>
            <Dashboard user={user} />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to={authed ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
