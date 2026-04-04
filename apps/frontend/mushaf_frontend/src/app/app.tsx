import { useState } from 'react';
import { UploadPage } from './UploadPage';
import { ViewPage } from './ViewPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
        <h2 className="brand">Mushaf App</h2>
        <nav className="side-menu">
          <button 
            className={`menu-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('upload');
              closeSidebar();
            }}
          >
            📤 Upload Page
          </button>
          <button 
            className={`menu-item ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('view');
              closeSidebar();
            }}
          >
            📖 View Pages
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
