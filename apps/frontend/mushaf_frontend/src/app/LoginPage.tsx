import { useState, FormEvent } from 'react';
import { useAuth } from './AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Props {
  onSwitchToSignup: () => void;
}

export function LoginPage({ onSwitchToSignup }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.token, data.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel fade-in">
        {/* Logo / Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">📖</div>
          <h1 className="auth-title">Mushaf App</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="status-msg error" style={{ marginTop: 0 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-loading">
                <span className="auth-spinner" /> Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={onSwitchToSignup}
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
