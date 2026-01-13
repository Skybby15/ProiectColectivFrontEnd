import { DefaultApi, Configuration } from '@/api';
import { useVoiceStore } from '@/services/stores/useVoiceStore';

export function makeApi(token?: string): DefaultApi | null {
  if (!token) return null;
  const basePath = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const config = new Configuration({ apiKey: `Bearer ${token}`, basePath });
  return new DefaultApi(config);
}

export async function fetchAndUpdateUserInfo(api: DefaultApi | null, userId: string, setUsers: (u: any) => void) {
  if (!api) {
    console.log('[voiceHelpers] API not ready for', userId);
    const current = useVoiceStore.getState().users;
    if (!current.some((u) => String(u.userId) === String(userId))) {
      setUsers([...current, { userId: String(userId), username: `User ${String(userId).slice(-4)}` }]);
    }
    return;
  }
  try {
    console.log('[voiceHelpers] fetching user info for', userId);
    const resp = await api.usersIdGet(userId);
    console.log('[voiceHelpers] got response for', userId, resp);
    const userData = (resp as any)?.data || resp;
    console.log('[voiceHelpers] userData extracted:', userData);

    if (userData && (userData.username || userData.firstname)) {
      console.log('[voiceHelpers] updating with username:', userData.username || userData.firstname);
      const current = useVoiceStore.getState().users;
      const updated = current.map((u) =>
        String(u.userId) === String(userId)
          ? { ...u, username: userData.username || userData.firstname || u.username }
          : u
      );
      if (!updated.some((u) => String(u.userId) === String(userId))) {
        updated.push({ userId: String(userId), username: userData.username || userData.firstname });
      }
      setUsers(updated);
    } else {
      console.log('[voiceHelpers] no username/firstname in userData, applying fallback display name');
      const current = useVoiceStore.getState().users;
      const updated = current.map((u) => (String(u.userId) === String(userId) ? { ...u, username: `User ${String(userId).slice(-4)}` } : u));
      if (!updated.some((u) => String(u.userId) === String(userId))) updated.push({ userId: String(userId), username: `User ${String(userId).slice(-4)}` });
      setUsers(updated);
    }
  } catch (e) {
    console.error('[voiceHelpers] fetch user info failed for', userId, e);
    try {
      const current = useVoiceStore.getState().users;
      const fallback = `User ${String(userId).slice(-4)}`;
      if (!current.some((u) => String(u.userId) === String(userId))) {
        setUsers([...current, { userId: String(userId), username: fallback }]);
      } else {
        const updated = current.map((u) => (String(u.userId) === String(userId) ? { ...u, username: fallback } : u));
        setUsers(updated);
      }
    } catch {}
  }
}

export function stopAllRemoteAudio(audioElsRef: Record<string, HTMLAudioElement>, clearSrc = true) {
  try {
    Object.values(audioElsRef || {}).forEach((el) => {
      try {
        el.pause();
        el.muted = true;
        if (clearSrc) {
          try { (el as any).srcObject = null; } catch {}
        }
      } catch {}
    });
  } catch {}
}

export function normalizeRoomUsers(entries: any[], authUser?: any) {
  return entries.map((entry: any) => {
    if (entry && typeof entry === 'object') {
      const uid = String(entry.userId ?? entry.id ?? entry.user ?? '');
      const username = entry.username ?? entry.name ?? entry.displayName ?? uid;
      if (String(uid) === String(authUser?.id) && (authUser as any)?.username) {
        return { userId: uid, username: (authUser as any).username };
      }
      return { userId: uid, username };
    }
    return { userId: String(entry), username: String(entry) };
  });
}
