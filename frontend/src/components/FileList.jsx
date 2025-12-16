import React, { useState } from 'react';
import api from '../api/client';
import ShareModal from './ShareModal.jsx';

function FileRow({ file, onRefresh }) {
  const [sharing, setSharing] = useState(false);

  const download = () => {
    const url = `${api.defaults.baseURL}/files/${file._id || file.id}/download`;
    window.location.href = url; // uses cookie for auth
  };

  return (
    <tr>
      <td>{file.originalName}</td>
      <td>{file.mimetype}</td>
      <td>{(file.size / 1024).toFixed(1)} KB</td>
      <td>{new Date(file.uploadedAt).toLocaleString()}</td>
      <td>
        <button onClick={download}>Download</button>
        <button style={{ marginLeft: 8 }} onClick={() => setSharing(true)}>Share</button>
        {sharing && (
          <ShareModal fileId={file._id || file.id} onClose={() => setSharing(false)} />
        )}
      </td>
    </tr>
  );
}

export default function FileList({ title, files, onRefresh }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3>{title}</h3>
      {files.length === 0 ? (
        <div style={{ color: '#666' }}>No files</div>
      ) : (
        <table width="100%" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Filename</th>
              <th align="left">Type</th>
              <th align="left">Size</th>
              <th align="left">Uploaded</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <FileRow key={(f._id || f.id)} file={f} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
