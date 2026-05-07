import { useState } from 'react';
import { useAuth } from './AuthContext';

export function UploadPage({ onPageSelected }: { onPageSelected: (page: number) => void }) {
  const { token } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${BASE_URL}/pages/${pageNumber}`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }

      setStatus({ type: 'success', msg: `Page ${pageNumber} uploaded successfully!` });
      setTimeout(() => onPageSelected(pageNumber), 1500); // Wait briefly so user sees MSG
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Upload Mushaf Page</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Select a .docx file and specify which page number it represents.
      </p>

      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label htmlFor="pageNumber">Page Number</label>
          <input
            id="pageNumber"
            type="number"
            min="1"
            max="604"
            value={pageNumber}
            onChange={(e) => setPageNumber(parseInt(e.target.value, 10))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">Document (.docx)</label>
          <input
            id="file"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <button type="submit" className="primary" disabled={loading || !file} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'Uploading & Parsing...' : 'Upload Page'}
        </button>
      </form>

      {status && (
        <div className={`status-msg ${status.type}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
