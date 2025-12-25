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

  // Use Supabase Auth if configured
  if (isSupabaseConfigured()) {
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
      return {
        success: false,
        error: 'Connection error. Please try again.',
      };
    }
  }

  // Fallback: Mock auth for development without Supabase
  console.log('Using mock authentication (Supabase not configured)');
  const user: User = { email: email.toLowerCase().trim() };
  await stateManager.setUser(user);
  return { success: true, user };
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
 * Get currently logged-in user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return { email: user.email || '' };
      }
    } catch (err) {
      console.error('Error getting current user:', err);
    }
  }
  
  // Fallback to local state
  return stateManager.getUser();
}
