import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { UploadPage } from './UploadPage';
import { ViewPage } from './ViewPage';

// ── Inner app — only mounted after auth is resolved ───────────────────────────

function AppInner() {
  const { isAuthenticated, isLoading, user, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'view'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // While rehydrating from localStorage, show nothing to avoid flash
  if (isLoading) {
    return (
      <div className="auth-page">
        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading…</div>
      </div>
    );
  }

  // Not logged in → show Login or Signup
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
    ) : (
      <SignupPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Logged in → full app layout
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar} id="sidebar-toggle-btn">
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
            className={`menu-item ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view'); closeSidebar(); }}
          >
            📖 View Pages
          </button>

          {hasPermission('upload') && (
            <button
              className={`menu-item ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); closeSidebar(); }}
            >
              📤 Upload Page
            </button>
          )}
        </nav>

        {/* User info + Logout in sidebar footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            ↩ Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="app-container">
          {activeTab === 'upload' && hasPermission('upload') && (
            <UploadPage onPageSelected={() => setActiveTab('view')} />
          )}
          {activeTab === 'view' && <ViewPage initialPage={1} />}
        </div>
      </main>
    </div>
  );
}

// ── Root export — wraps with AuthProvider ─────────────────────────────────────

export function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
