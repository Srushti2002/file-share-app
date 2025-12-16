import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import UploadArea from '../components/UploadArea.jsx';
import FileList from '../components/FileList.jsx';

export default function Dashboard({ user }) {
  const [data, setData] = useState({ myFiles: [], sharedWithMe: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setError('');
    try {
      const { data } = await api.get('/files');
      setData(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user?.name || user?.email}</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <UploadArea onUploaded={load} />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <FileList title="My Files" files={data.myFiles} onRefresh={load} />
      <FileList title="Shared With Me" files={data.sharedWithMe} onRefresh={load} />
    </div>
  );
}
