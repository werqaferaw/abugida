import { getSupabase, isSupabaseConfigured } from './supabase-client';
import * as stateManager from './state-manager';

/**
 * Auth Service
 * 
 * Uses Supabase Auth for real authentication when configured,
 * falls back to mock auth for local development.
 */

interface User {
  email: string;
}

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Demo/Guest login for testing without authentication
 */
export async function loginAsGuest(): Promise<LoginResult> {
  const guestUser: User = { email: 'guest@demo.local' };
  await stateManager.setUser(guestUser);
  return { success: true, user: guestUser };
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  // Basic validation
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Please enter a valid email address',
    };
  }

  if (!password || password.length < 1) {
    return {
      success: false,
      error: 'Please enter a password',
    };
  }

  // If Supabase not configured, allow demo mode login
  if (!isSupabaseConfigured()) {
    // Demo mode - allow any login
    const user: User = { email: email.toLowerCase().trim() };
    await stateManager.setUser(user);
    return { success: true, user };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please confirm your email address',
        };
      }
      // Handle network errors from Supabase client
      if (error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Unable to connect to server. Please check your internet connection and try again.',
        };
      }
      if (error.message.includes('NetworkError') || error.message.includes('network')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    if (data.user) {
      const user: User = { email: data.user.email || email };
      await stateManager.setUser(user);
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Login failed',
    };
  } catch (err) {
    console.error('Supabase auth error:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    
    // Handle common network errors with user-friendly messages
    if (errorMsg.includes('fetch failed') || errorMsg.includes('ENOTFOUND') || errorMsg.includes('ECONNREFUSED')) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check your internet connection and try again.',
      };
    }
    if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
      return {
        success: false,
        error: 'Connection timed out. Please try again.',
      };
    }
    
    return {
      success: false,
      error: 'Connection error. Please try again.',
    };
  }
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string): Promise<LoginResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Sign up requires Supabase configuration',
    };
  }

  // Validation
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Please enter a valid email address',
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters',
    };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (data.user) {
      // Note: User might need to confirm email depending on Supabase settings
      if (data.user.confirmed_at) {
        const user: User = { email: data.user.email || email };
        await stateManager.setUser(user);
        return { success: true, user };
      } else {
        return {
          success: true,
          error: 'Please check your email to confirm your account',
        };
      }
    }

    return {
      success: false,
      error: 'Sign up failed',
    };
  } catch (err) {
    console.error('Supabase sign up error:', err);
    return {
      success: false,
      error: 'Connection error. Please try again.',
    };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase logout error:', err);
    }
  }
  await stateManager.setUser(null);
}

/**
 * Get currently logged-in user (Supabase required)
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    // No Supabase = no user
    await stateManager.setUser(null);
    return null;
  }
  
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // If there's an auth error or no user, session is invalid
    if (error || !user) {
      // No valid session, clear local state
      await stateManager.setUser(null);
      return null;
    }
    
    // User exists, sync to local state for consistency
    const userObj: User = { email: user.email || '' };
    await stateManager.setUser(userObj);
    return userObj;
  } catch (err) {
    console.error('Error getting current user:', err);
    // On error, clear local state to be safe
    await stateManager.setUser(null);
    return null;
  }
}
