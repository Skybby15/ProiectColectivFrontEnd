import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { getJoinableRooms } from '@/services/react-query/voice';
import { useAuthStore } from '@/services/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { api as generatedApi } from '@/services/react-query/api';
import { sendDirectMessageWithRetry } from '@/services/react-query/messages';
import { useVoiceStore } from '@/services/stores/useVoiceStore';

export default function CallNotifier() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const voice = useVoiceStore();
  const [incoming, setIncoming] = useState<{ roomId: string; callerId: string; callerName: string } | null>(null);
  const ignoredRoomsRef = useRef<Record<string, number>>({});
  const declinedRoomsRef = useRef<Record<string, boolean>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!auth.user?.id) return;
    // don't poll while user is already in a call
    let mounted = true;
    let poll: any = null;
    const check = async () => {
      try {
        if (voice.selectedRoomId || voice.ws) return;
        const rooms = await getJoinableRooms(String(auth.user!.id));
        if (!mounted || !rooms) return;
        const inc = rooms.find((r: any) => r.type === 'private' && r.createdBy !== String(auth.user!.id));
        if (inc) {
          const idStr = String(inc.id);
          // if we've locally declined this room recently, skip it
          if (declinedRoomsRef.current[idStr]) return;
          let callerName = inc.createdBy || 'Unknown';
          try {
            const uresp = await generatedApi.usersIdGet(String(inc.createdBy));
            const udata = (uresp && (uresp as any).data) || null;
            if (udata) {
              const raw = udata.username || udata.name || `${udata.firstname || ''} ${udata.lastname || ''}`.trim() || udata;
              if (raw && typeof raw === 'string') callerName = raw;
              else if (raw && typeof raw === 'object') callerName = raw.username || raw.name || String(inc.createdBy);
              else callerName = String(raw);
            }
          } catch (e) {}
          const expires = ignoredRoomsRef.current[idStr];
          if (expires && Date.now() < expires) return;
          if (!incoming || incoming.roomId !== idStr) setIncoming({ roomId: idStr, callerId: String(inc.createdBy), callerName });
          return;
        }
        // otherwise clear incoming
        if (incoming) setIncoming(null);
      } catch (e) {}
    };
    poll = window.setInterval(check, 3000);
    check();
    return () => { mounted = false; if (poll) clearInterval(poll); mountedRef.current = false; };
  }, [auth.user?.id, voice.selectedRoomId, voice.ws]);

  // hide incoming if user joined the same room elsewhere (prevents sticky notification)
  useEffect(() => {
    try {
      if (!incoming) return;
      const sel = voice.selectedRoomId ? String(voice.selectedRoomId) : null;
      if (sel && incoming && String(incoming.roomId) === sel) {
        if (mountedRef.current) setIncoming(null);
      }
    } catch (e) { /* ignore */ }
  }, [voice.selectedRoomId, incoming]);

  if (!incoming) return null;

  return (
    <div className="fixed right-6 top-20 z-50">
      <div className="border border-neutral-800 rounded-lg bg-neutral-800/95 p-4 shadow-lg">
        <div className="mb-2 text-sm text-gray-200">{incoming.callerName} is calling you</div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-green-600 text-white" onClick={async () => {
            const rid = String(incoming.roomId);
            try {
              try { await sendDirectMessageWithRetry(String(incoming.callerId), String(auth.user!.id), `call_accepted:${incoming.roomId}`); } catch (e) { console.warn('call_accepted send failed', e); }
            } catch (e) { console.warn('call accept outer error', e); }
            // prevent this room from re-appearing briefly after navigation
            ignoredRoomsRef.current[rid] = Date.now() + 120_000;
            declinedRoomsRef.current[rid] = false;
            try { navigate(`/private-call/${incoming.roomId}?caller=${encodeURIComponent(String(incoming.callerId))}`); } catch (e) { console.warn('navigate failed', e); }
            if (mountedRef.current) setIncoming(null);
          }}>Accept</Button>
          <Button size="sm" variant="ghost" onClick={async () => {
            const rid = String(incoming.roomId);
            try {
              try { await sendDirectMessageWithRetry(String(incoming.callerId), String(auth.user!.id), `call_declined:${incoming.roomId}`); } catch (e) { console.warn('call_declined send failed', e); }
              // mark declined/ignored for a longer window to avoid reappearing after leaving
              ignoredRoomsRef.current[rid] = Date.now() + 120_000;
              declinedRoomsRef.current[rid] = true;
            } catch (e) { console.warn('decline error', e); }
            if (mountedRef.current) setIncoming(null);
          }}>Decline</Button>
        </div>
      </div>
    </div>
  );
}
