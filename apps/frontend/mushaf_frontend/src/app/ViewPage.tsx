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
}
interface Page {
  pageNumber: number;
  lines: Line[];
}

export function ViewPage({ pageNumber, onBack }: { pageNumber: number, onBack: () => void }) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3000/pages/${pageNumber}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Page not uploaded yet.');
          throw new Error(`Failed to load page. Status: ${res.status}`);
        }
        const data = await res.json();
        setPage(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [pageNumber]);

  return (
    <div className="fade-in">
      <div className="header">
        <h1>Page {pageNumber}</h1>
        <button onClick={onBack}>← Back to Uploads</button>
      </div>

      {loading && <div style={{ marginTop: '2rem', textAlign: 'center' }}>Loading specific color segments...</div>}
      
      {error && (
        <div className="glass-panel" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Not Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      )}

      {page && (
        <div className="verse-container">
          {page.lines.map((line) => (
            <div key={line.lineNumber} className="glass-panel verse-card">
              <div className="arabic-header">
                {line.arabicText}
              </div>
              
              <div className="segments-grid">
                {/* We map over arabicSegments assuming tamilSegments align by order limit */}
                {line.arabicSegments.map((arabSeg, i) => {
                  const tamilSeg = line.tamilSegments.find(ts => ts.order === arabSeg.order);
                  return (
                    <div key={i} className="segment-column">
                      {/* Arabic Box */}
                      <div className="segment-cell arabic">
                        {arabSeg.runs.map((r, ri) => (
                          <span key={ri} style={{ color: r.color || 'inherit' }}>
                            {r.text}
                          </span>
                        ))}
                      </div>
                      
                      {/* Tamil Box Below it */}
                      {tamilSeg && (
                        <div className="segment-cell tamil">
                          {tamilSeg.runs.map((r, ri) => (
                            <span key={ri} style={{ color: r.color || 'inherit' }}>
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
