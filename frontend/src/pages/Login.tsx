
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from || '/';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');

    if (!credentialResponse.credential) {
      setError('Google login failed. No credential received.');
      return;
    }

    try {
      setLoading(true);

      await loginWithGoogle(credentialResponse.credential);

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Google login failed. Please try again.'
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
        background: '#070b24',
        color: '#fff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #292653',
          background: '#0d1230',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
        }}
      >
        <h1
          style={{
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          Welcome back
        </h1>

        <p
          style={{
            marginBottom: '28px',
            color: '#999',
            textAlign: 'center',
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
                border: '1px solid #30345c',
                background: '#080d25',
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
                border: '1px solid #30345c',
                background: '#080d25',
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
                border: '1px solid #5a2525',
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
              background: loading
                ? '#45405f'
                : 'linear-gradient(90deg, #7c3aed, #4f46e5)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '24px 0',
            color: '#777',
            fontSize: '12px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#30345c',
            }}
          />

          OR

          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#30345c',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setError('Google login failed. Please try again.')
            }
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="100%"
          />
        </div>

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
              color: '#a78bfa',
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