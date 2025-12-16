import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Register({ onAuthed }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      onAuthed(data);
      navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit">Register</button>
      </form>
      <div style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
}
