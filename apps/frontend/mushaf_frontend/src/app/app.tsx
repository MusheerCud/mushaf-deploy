import { useState } from 'react';
import { UploadPage } from './UploadPage';
import { ViewPage } from './ViewPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>('upload');

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <h2 className="brand">Mushaf App</h2>
        <nav className="side-menu">
          <button 
            className={`menu-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Page
          </button>
          <button 
            className={`menu-item ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            View Pages
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="app-container">
          {activeTab === 'upload' && <UploadPage onPageSelected={() => setActiveTab('view')} />}
          {activeTab === 'view' && <ViewPage initialPage={1} />}
        </div>
      </main>
    </div>
  );
}

export default App;
