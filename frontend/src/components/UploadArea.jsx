import React, { useRef, useState } from 'react';
import api from '../api/client';

export default function UploadArea({ onUploaded }) {
  const inputRef = useRef();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');
    setBusy(true);
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    try {
      await api.post('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploaded?.();
      inputRef.current.value = '';
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ border: '2px dashed #aaa', padding: 16, borderRadius: 8 }}>
      <input ref={inputRef} type="file" multiple onChange={onChange} style={{ display: 'none' }} />
      <button onClick={onPick} disabled={busy}>{busy ? 'Uploading...' : 'Select files'}</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
