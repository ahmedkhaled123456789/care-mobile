import { authApi, profileApi, type SignupInput } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { clearPrivateQueries } from '../api/queryClient';
import type { User } from '../api/types';
import { useSession } from '../store/session';

/** Auth flows used by the screens. Every flow ends in `useSession` so navigation reacts to it. */
export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await authApi.login({ email: email.trim().toLowerCase(), password });
    clearPrivateQueries();
    await useSession.getState().setSession(res.token, res.data);
    return res.data;
  },

  async signup(body: SignupInput): Promise<User> {
    const res = await authApi.signup({ ...body, name: body.name.trim(), email: body.email.trim().toLowerCase() });
    clearPrivateQueries();
    await useSession.getState().setSession(res.token, res.data);
    return res.data;
  },

  /** resetPassword only returns a token — keep it in memory, load the profile, then persist both. */
  async loginWithToken(token: string): Promise<User> {
    useSession.getState().setToken(token);
    const me = await profileApi.getMe();
    clearPrivateQueries();
    await useSession.getState().setSession(token, me);
    return me;
  },

  async logout() {
    await useSession.getState().clear();
    clearPrivateQueries();
  },

  /** Re-validates the stored session at startup; network failures keep the cached profile. */
  async refreshProfile() {
    const { token } = useSession.getState();
    if (!token) return;
    try {
      const me = await profileApi.getMe();
      if (useSession.getState().token === token) await useSession.getState().updateUser(me);
    } catch {
      // 401 is handled by the unauthorized handler; anything else (offline…) keeps the cached user.
    }
  }
};

/** A rejected token (expired, password changed, deactivated…) ends the session app-wide. */
export function installUnauthorizedHandler() {
  setUnauthorizedHandler((message) => {
    if (!useSession.getState().token) return;
    void useSession.getState().clear(message);
    clearPrivateQueries();
  });
  return () => setUnauthorizedHandler(null);
}
