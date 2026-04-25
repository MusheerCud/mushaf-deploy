import { useState, FormEvent } from 'react';
import { useAuth } from './AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Props {
  onSwitchToLogin: () => void;
}

export function SignupPage({ onSwitchToLogin }: Props) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobileNumber, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Auto-login after successful registration
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
      <div className="auth-card auth-card--wide glass-panel fade-in">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">📖</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Mushaf App today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-grid">
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-mobile">Mobile Number</label>
              <input
                id="signup-mobile"
                type="tel"
                placeholder="+91 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
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
                <span className="auth-spinner" /> Creating account…
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
