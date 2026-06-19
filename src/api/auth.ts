/**
 * Auth API service — wraps /api/auth/* endpoints.
 *
 * Endpoints used:
 *   POST /api/auth/signup  → register a new user
 *   POST /api/auth/signin  → sign in, establishes session cookie
 *   POST /api/auth/signout → invalidates session
 *   GET  /api/auth/me      → returns current user from session (app-load check)
 *
 * Future considerations:
 *   - Add forgotPassword(email) → POST /api/auth/forgot-password
 *   - Add resetPassword(token, newPassword) → POST /api/auth/reset-password
 *   - Add verifyEmail(token) → POST /api/auth/verify-email
 *   - Add updateProfile(data) → PATCH /api/auth/me
 *   - Add changePassword(old, new) → PUT /api/auth/password
 */

import { get, post } from './client';

// ── Shared types ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];

  // Future fields (backend will return these once implemented):
  // avatarUrl?: string;
  // displayName?: string;
  // teamId?: string;
  // xp?: number;
  // level?: number;
}

// ── Signup ────────────────────────────────────────────────────────────────────

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  /** Optional explicit username handle — auto-derived on backend if omitted */
  username?: string;
}

export function signUp(payload: SignupPayload): Promise<AuthUser> {
  return post<AuthUser>('/auth/signup', payload);
}

// ── Signin ────────────────────────────────────────────────────────────────────

export interface SigninPayload {
  email: string;
  password: string;
}

export function signIn(payload: SigninPayload): Promise<AuthUser> {
  return post<AuthUser>('/auth/signin', payload);
}

// ── Signout ───────────────────────────────────────────────────────────────────

export function signOut(): Promise<void> {
  return post<void>('/auth/signout');
}

// ── Current user ──────────────────────────────────────────────────────────────

/**
 * Fetches the currently authenticated user from the session.
 * Returns null (instead of throwing) when the session is expired or absent —
 * used on app mount to silently restore login state.
 */
export async function getMe(): Promise<AuthUser | null> {
  try {
    return await get<AuthUser>('/auth/me');
  } catch {
    // 401 = no active session → not logged in, that's fine
    return null;
  }
}
