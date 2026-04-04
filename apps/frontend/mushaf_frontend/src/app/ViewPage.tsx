import { useState, useEffect } from 'react';

// Type definitions matching backend schema
interface Run {
  text: string;
  color: string | null;
}
interface Segment {
  order: number;
  runs: Run[];
}
interface Line {
  lineNumber: number;
  verseNumber: number;
  arabicText: string;
  arabicSegments: Segment[];
  tamilSegments: Segment[];
  tagSegments?: Segment[];
}
interface Page {
  pageNumber: number;
  lines: Line[];
}

export function ViewPage({ initialPage = 1 }: { initialPage?: number }) {
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [searchInput, setSearchInput] = useState(initialPage);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const fetchPage = async (num: number) => {
    setLoading(true);
    setError(null);
    setDeleteStatus(null);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${BASE_URL}/pages/${num}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error(`Page ${num} not uploaded yet.`);
        throw new Error(`Failed to load page. Status: ${res.status}`);
      }
      const data = await res.json();
      setPage(data);
    } catch (err: any) {
      setPage(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(pageNumber);
  }, [pageNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(searchInput);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete Page ${pageNumber}?`)) return;
    
    setLoading(true);
    setError(null);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('Sending DELETE request to:', `${BASE_URL}/pages/${pageNumber}`);
      const res = await fetch(`${BASE_URL}/pages/${pageNumber}`, {
        method: 'DELETE',
      });
      console.log('DELETE response status:', res.status);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete page');
      }
      setPage(null);
      setDeleteStatus({ type: 'success', msg: `Page ${pageNumber} has been successfully deleted.` });
    } catch (err: any) {
      setDeleteStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="header">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Page:</label>
            <input 
              type="number" 
              min="1" 
              max="604" 
              value={searchInput} 
              onChange={(e) => setSearchInput(parseInt(e.target.value, 10))} 
              style={{ width: '80px', textAlign: 'center' }}
            />
            <button type="submit" className="primary">Search</button>
          </form>
          
          {page && (
            <button 
              onClick={handleDelete} 
              className="delete-btn"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
        
        {page && (
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Showing Page <strong>{page.pageNumber}</strong>
          </div>
        )}
      </div>

      {deleteStatus && (
        <div className={`status-msg ${deleteStatus.type}`} style={{ marginBottom: '2rem' }}>
          {deleteStatus.msg}
        </div>
      )}

      {loading && <div style={{ marginTop: '2rem', textAlign: 'center' }}>Loading specific color segments...</div>}
      
      {error && !loading && !deleteStatus && (
        <div className="glass-panel" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Not Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      )}

      {page && !loading && (
        <div className="verse-container">
          {page.lines.map((line) => (
            <div key={line.lineNumber} className="glass-panel verse-card">
              <div className="arabic-header">
                {line.arabicText}
              </div>
              
              <div className="segments-grid">
                {line.arabicSegments.map((arabSeg, i) => {
                  const tamilSeg = line.tamilSegments.find(ts => ts.order === arabSeg.order);
                  const tagSeg = line.tagSegments?.find(ts => ts.order === arabSeg.order);
                  return (
                    <div key={i} className="segment-column">
                      <div className="segment-cell arabic">
                        {arabSeg.runs.map((r, ri) => (
                          <span key={ri} style={{ color: r.color || 'inherit' }}>
                            {r.text}
                          </span>
                        ))}
                      </div>
                      
                      {tamilSeg && (
                        <div className="segment-cell tamil">
                          {tamilSeg.runs.map((r, ri) => (
                            <span key={ri} style={{ color: r.color || 'inherit' }}>
                              {r.text}
                            </span>
                          ))}
                        </div>
                      )}

                      {tagSeg && tagSeg.runs.length > 0 && (
                        <div className="segment-cell tag" style={{ background: 'rgba(235, 87, 87, 0.05)', borderColor: 'rgba(235, 87, 87, 0.2)' }}>
                          {tagSeg.runs.map((r, ri) => (
                            <span key={ri} style={{ color: r.color || '#EB5757', fontWeight: 600 }}>
                              {r.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
