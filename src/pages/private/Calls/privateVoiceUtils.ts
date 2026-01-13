export function sanitizeName(raw: any, uid: string) {
  try {
    if (!raw && raw !== 0) return `User ${String(uid).slice(-4)}`;
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
    if (typeof raw === 'object') {
      const cand = raw.username || raw.name || raw.displayName || `${raw.firstname || ''} ${raw.lastname || ''}`.trim();
      if (cand && typeof cand === 'string' && cand.length > 0) return cand;
      const parts = [] as string[];
      if (raw.firstname) parts.push(String(raw.firstname));
      if (raw.lastname) parts.push(String(raw.lastname));
      if (parts.length) return parts.join(' ');
      return `User ${String(uid).slice(-4)}`;
    }
    return String(raw);
  } catch (e) {
    return `User ${String(uid).slice(-4)}`;
  }
}
