import React, { useState } from 'react';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGuestLogin: () => Promise<{ success: boolean; error?: string }>;
}

type AuthMode = 'login' | 'signup';

export function LoginScreen({ onLogin, onGuestLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Validate password match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        // Sign up
        const result = await window.electronAPI.auth.signUp(email, password);
        if (result.success) {
          if (result.error) {
            // Success but needs email confirmation
            setSuccess(result.error);
            setMode('login');
          } else if (result.user) {
            // Auto-logged in
            await onLogin(email, password);
          }
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        // Login
        const result = await onLogin(email, password);
        if (!result.success && result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
    setConfirmPassword('');
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await onGuestLogin();
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-text">አ</span>
          </div>
          <h1 className="login-title">Abugida</h1>
          <p className="login-subtitle">Amharic Font Manager</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => toggleMode()}
            type="button"
          >
            Sign In
          </button>
          <button 
            className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => toggleMode()}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="login-field">
              <label htmlFor="confirm-password" className="login-label">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="login-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {success && (
            <div className="login-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="login-button-loading">
                <span className="login-spinner" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="login-guest-button"
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          Continue as Guest
        </button>

        <p className="login-hint">
          {mode === 'login' 
            ? "Don't have an account? Click Sign Up above"
            : "Already have an account? Click Sign In above"
          }
        </p>
      </div>
    </div>
  );
}
