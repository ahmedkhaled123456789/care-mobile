import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import type { User } from '../api/types';

const TOKEN_KEY = 'rc.token';
const USER_KEY = 'rc.user';

export type SessionStatus = 'restoring' | 'guest' | 'authenticated';

/** The minimal profile kept on the device (well under SecureStore's ~2 KB value limit). */
export type SessionUser = Pick<User, '_id' | 'name' | 'email' | 'role' | 'phone' | 'profileImg' | 'createdAt'>;

interface SessionState {
  status: SessionStatus;
  token: string | null;
  user: SessionUser | null;
  /** Set when the server rejected the token, so the login screen can explain why. */
  expiredReason: string | null;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: User | SessionUser) => Promise<void>;
  /** Stores a token returned without a user (resetPassword) before the profile is fetched. */
  setToken: (token: string) => void;
  updateUser: (user: User | SessionUser) => Promise<void>;
  clear: (expiredReason?: string | null) => Promise<void>;
  acknowledgeExpiry: () => void;
}

/** Never keep the password hash / reset fields or large arrays — only what the UI needs. */
export function toSessionUser(u: User | SessionUser): SessionUser {
  return { _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, profileImg: u.profileImg, createdAt: u.createdAt };
}

async function persist(token: string | null, user: SessionUser | null) {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
    if (user) await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    else await SecureStore.deleteItemAsync(USER_KEY);
  } catch {
    /* secure storage unavailable — the session lives in memory for this run */
  }
}

/**
 * Auth session. The JWT is only persisted in the platform keychain/keystore
 * (expo-secure-store); the API client reads it from this store in memory.
 */
export const useSession = create<SessionState>((set, get) => ({
  status: 'restoring',
  token: null,
  user: null,
  expiredReason: null,

  hydrate: async () => {
    try {
      const [token, rawUser] = await Promise.all([SecureStore.getItemAsync(TOKEN_KEY), SecureStore.getItemAsync(USER_KEY)]);
      const user = rawUser ? (JSON.parse(rawUser) as SessionUser) : null;
      if (token && user) return set({ status: 'authenticated', token, user });
      if (token) await persist(null, null); // token without a profile — start clean
    } catch {
      /* unreadable entry — treat as logged out */
    }
    set({ status: 'guest', token: null, user: null });
  },

  setSession: async (token, user) => {
    const safe = toSessionUser(user);
    set({ status: 'authenticated', token, user: safe, expiredReason: null });
    await persist(token, safe);
  },

  setToken: (token) => set({ token }),

  updateUser: async (user) => {
    const { token } = get();
    if (!token) return;
    const safe = toSessionUser(user);
    set({ user: safe });
    await persist(token, safe);
  },

  clear: async (expiredReason = null) => {
    set({ status: 'guest', token: null, user: null, expiredReason });
    await persist(null, null);
  },

  acknowledgeExpiry: () => set({ expiredReason: null })
}));

export const getToken = () => useSession.getState().token;
