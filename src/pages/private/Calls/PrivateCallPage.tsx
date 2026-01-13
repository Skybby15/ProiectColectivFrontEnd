import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/teamComponents/NavBar';
import { useAuthStore } from '@/services/stores/useAuthStore';
import { useVoiceStore } from '@/services/stores/useVoiceStore';
import { PrivateVoiceRoom } from '@/pages/private/Calls/PrivateVoiceRoom';
import { Button } from '@/components/ui/button';
import { api as generatedApi } from '@/services/react-query/api';
import { sendDirectMessageWithRetry } from '@/services/react-query/messages';
import { toast } from 'sonner';
const WSPATH = import.meta.env.VITE_WSPATH;

export default function PrivateCallPage() {
  const { roomId } = useParams();
  const search = new URLSearchParams(window.location.search);
  const calleeId = search.get('callee');
  const callerId = search.get('caller');
  // peerId is the other user in the call (callee for the caller; caller for the callee)
  const peerId = calleeId || callerId || undefined;
  const navigate = useNavigate();
  const auth = useAuthStore();
  const voice = useVoiceStore();

  // Track rooms we've already handled a decline/ended notification for
  const handledRoomsRef = useRef<Record<string, boolean>>({});

  const handleRoomNotification = (roomIdToHandle: string, msg: string) => {
    try {
      if (!roomIdToHandle) return false;
      if (handledRoomsRef.current[roomIdToHandle]) return false;
      handledRoomsRef.current[roomIdToHandle] = true;
      try { toast.error(msg); } catch {}
      try { voice.reset(); } catch {}
      try { navigate('/friends'); } catch {}
      return true;
    } catch (e) { return false; }
  };

  useEffect(() => {
    if (!roomId) return;
    // select the room in the voice store so TeamVoiceRoom picks it up
    voice.selectRoom(roomId);
    // cleanup on leave
    return () => {
      voice.selectRoom(undefined);
    };
  }, [roomId]);

  // Listen for direct message decline notifications so caller can be returned to friends
  useEffect(() => {
    if (!auth.token) return;
    if (!roomId) return;
    let ws: WebSocket | undefined;
    let pollHandle: any = null;

    // Helper: attempt a single WebSocket connection and resolve only when opened.
    const connectOnce = (timeoutMs = 5000): Promise<WebSocket> => {
      return new Promise((resolve, reject) => {
        let settled = false;
        try {
          const socket = new WebSocket(`ws://${WSPATH}/messages/connect?token=${auth.token}`);

          const timer = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            try { socket.close(); } catch (_) {}
            reject(new Error('connect timeout'));
          }, timeoutMs);

          socket.onopen = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(socket);
          };

          socket.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            try { socket.close(); } catch (_) {}
            reject(new Error('ws error'));
          };

          socket.onclose = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(new Error('ws closed'));
          };
        } catch (e) {
          reject(e);
        }
      });
    };

    // Try multiple times with exponential backoff before falling back to polling
    const connectWithRetry = async (attempts = 3) => {
      for (let i = 0; i < attempts; i++) {
        try {
          const s = await connectOnce(5000 + i * 2000);
          return s;
        } catch (err) {
          const backoff = 500 * Math.pow(2, i);
          // last attempt failed -> rethrow
          if (i === attempts - 1) throw err;
          // otherwise wait and retry
          await new Promise((res) => setTimeout(res, backoff));
        }
      }
      throw new Error('failed to connect');
    };

    // Attempt to connect; if it fails after retries, start polling fallback
    (async () => {
      try {
        ws = await connectWithRetry(3);

        // wire message handlers now that ws is open
        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            const messageDto = data.payload;
            const text = messageDto?.textContent;
                if (typeof text === 'string') {
                  if (text.startsWith('call_declined:') || text.startsWith('call_declined:') || text.startsWith('call_declined:')) {
                    const rid = text.split(':')[1];
                    if (rid === roomId) {
                      try { handleRoomNotification(rid, 'Call declined by user'); } catch {}
                      return;
                    }
                  }
                  if (text.startsWith('call-ended:')) {
                    const rid = text.split(':')[1];
                    if (rid === roomId) {
                      try { handleRoomNotification(rid, 'Call ended'); } catch {}
                      return;
                    }
                  }
                }
          } catch (e) {}
        };

        ws.onerror = () => {
          // if the ws later errors/close, fall back to polling
          startPollingFallback();
        };
        ws.onclose = () => {
          startPollingFallback();
        };
      } catch (e) {
        console.warn('messages WS connect failed after retries, falling back to polling', e);
        startPollingFallback();
      }
    })();

    function startPollingFallback() {
      if (pollHandle) return;
      pollHandle = window.setInterval(async () => {
        try {
          // Poll messages between caller (auth.user) and callee (calleeId) to detect explicit decline
          if (!calleeId) return;
          if (!peerId) return;
          const msgsResp = await generatedApi.messagesGet('direct', String(auth.user?.id), String(peerId));
          const msgs = (msgsResp && (msgsResp as any).data) || [];
          const declined = msgs.find((m: any) => typeof m.textContent === 'string' && m.textContent === `call_declined:${roomId}` && String(m.receiverId) === String(auth.user?.id));
          if (declined) {
            clearInterval(pollHandle);
            try { handleRoomNotification(String(roomId), 'Call declined by user'); } catch {}
            return;
          }
          const ended = msgs.find((m: any) => typeof m.textContent === 'string' && m.textContent === `call-ended:${roomId}` && String(m.receiverId) === String(auth.user?.id));
          if (ended) {
            clearInterval(pollHandle);
            try { handleRoomNotification(String(roomId), 'Call ended'); } catch {}
            return;
          }
        } catch (e) {}
      }, 2000);
    }

    return () => {
      try { if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) ws.close(); } catch {}
      if (pollHandle) clearInterval(pollHandle);
    };
  }, [auth.token, roomId]);

  // Also listen to the voice WebSocket (if created) for immediate fallback signals
  useEffect(() => {
    if (!roomId) return;
    const voiceWs = voice.ws;
    if (!voiceWs) return;

    const handler = (ev: MessageEvent) => {
      try {
        const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        if (!data || typeof data !== 'object') return;
        const t = data.type;
        const rid = data.roomId || data.room || null;
        if (rid !== roomId) return;
        if (t === 'call_declined' || (t === 'call-ended' && data.reason === 'declined')) {
          try { handleRoomNotification(String(rid), 'Call declined by user'); } catch {}
        } else if (t === 'call-ended') {
          try { handleRoomNotification(String(rid), 'Call ended'); } catch {}
        }
      } catch (e) {}
    };

    try {
      voiceWs.addEventListener('message', handler as any);
    } catch (e) {}

    return () => {
      try { voiceWs.removeEventListener('message', handler as any); } catch (e) {}
    };
  }, [voice.ws, roomId]);

  const handleEnd = () => {
    try {
      const ws = voice.ws;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'call-ended', roomId })); } catch {}
      }
    } catch {}
    // Also send a direct message to the peer so they get notified when WS is down
    (async () => {
      try {
        if (peerId) {
          try {
            await sendDirectMessageWithRetry(String(peerId), String(auth.user?.id), `call-ended:${roomId}`);
          } catch (e) {
            console.warn('Failed to send call-ended message after retries', e);
          }
        }
      } catch (e) {}
      // small delay to allow signal to propagate
      setTimeout(() => {
        voice.reset();
        navigate('/friends');
      }, 200);
    })();
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Private Call</h2>
            <p className="text-sm text-gray-400">Private call with your friend</p>
          </div>
          <div>
            <Button variant="ghost" onClick={handleEnd}>End Call</Button>
          </div>
        </div>

          <div className="border border-neutral-800 rounded-lg bg-neutral-800/80 p-4 h-[70vh]">
            {/* Use PrivateVoiceRoom for private calls to keep separate from teams */}
            <PrivateVoiceRoom autoJoin={true} onCallEnded={() => { handleEnd(); }} />
          </div>
      </main>
    </div>
  );
}
