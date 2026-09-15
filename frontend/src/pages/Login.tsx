import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/';

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #333',
          background: '#1a1a1a',
        }}
      >
        <h1
          style={{
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          Welcome back
        </h1>

        <p
          style={{
            marginBottom: '28px',
            color: '#999',
          }}
        >
          Sign in to continue to ReelSmith.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#111',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#111',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: '18px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#3a1717',
                color: '#ff8a8a',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              background: loading ? '#555' : '#fff',
              color: '#111',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}