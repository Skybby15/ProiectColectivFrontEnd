import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/services/stores/useAuthStore';
import { useVoiceStore } from '@/services/stores/useVoiceStore';
import { buildJoinWsUrl } from '@/services/react-query/voice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { api as generatedApi } from '@/services/react-query/api';

export function PrivateCallRoom({ autoJoin, onCallEnded }: { autoJoin?: boolean; onCallEnded?: () => void } = { autoJoin: false }) {
  const { selectedRoomId, users, addUser, removeUser, setWs, ws, setUsers, setSpeaking, speaking } = useVoiceStore();
  const { user, token } = useAuthStore();
  const [joined, setJoined] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const pcRefs = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElsRef = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (!ws) setJoined(false);
  }, [ws]);

  useEffect(() => {
    // cleanup when switching rooms
    setUsers([]);
    setJoined(false);
    if (ws) { try { ws.close(); } catch {} setWs(undefined); }
    try {
      Object.values(pcRefs.current).forEach((p) => { try { p.close(); } catch {} });
      pcRefs.current = {};
      if (localStreamRef.current) { localStreamRef.current.getTracks().forEach((t) => t.stop()); localStreamRef.current = null; }
      Object.values(audioElsRef.current).forEach((el) => { try { el.pause(); if (el.parentNode) el.parentNode.removeChild(el); } catch {} });
      audioElsRef.current = {};
    } catch {}
  }, [selectedRoomId]);

  const doJoin = async () => {
    if (!selectedRoomId || !user?.id) return;
    const base = buildJoinWsUrl(selectedRoomId, String(user.id));
    const url = token ? `${base}&token=${encodeURIComponent(token)}` : base;
    const conn = new WebSocket(url);
    setWs(conn);

    let vadRunning = false;
    function sendSafe(payload: any) {
      try { if (conn && conn.readyState === WebSocket.OPEN) conn.send(typeof payload === 'string' ? payload : JSON.stringify(payload)); } catch {}
    }

    conn.onopen = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setJoined(true);
        addUser(String(user.id));
        try { sendSafe({ type: 'ready' }); } catch {}

        // VAD: send activity messages and set local speaking
        try {
          const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);
          let speakingState = false;
          vadRunning = true;
          const sample = () => {
            if (!vadRunning) return;
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / data.length);
            const isSpeaking = rms > 0.02;
            if (isSpeaking !== speakingState) {
              speakingState = isSpeaking;
              try { setSpeaking && setSpeaking(String(user.id), isSpeaking); } catch {}
              try { sendSafe({ type: 'activity', active: isSpeaking }); } catch {}
            }
            requestAnimationFrame(sample);
          };
          sample();
        } catch (e) { /* ignore vad errors */ }
      } catch (e) { console.error('getUserMedia failed', e); }
    };

    conn.onmessage = async (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const from = msg.from;
        if (msg.type === 'call-ended') {
          try { conn.close(); } catch {}
          setJoined(false);
          setWs(undefined);
          onCallEnded && onCallEnded();
          return;
        }
        if (msg.type === 'room-info' && Array.isArray(msg.users)) {
          const mapped = msg.users.map((u: any) => ({ userId: String(u.userId ?? u.id ?? u), username: u.username }));
          setUsers(mapped);
          return;
        }
        if (msg.type === 'ready' && from) {
          // immediately add user so they appear before sending audio
          addUser(String(from));
          // try fetching username
          try {
            const uresp = await generatedApi.usersIdGet(String(from));
            const udata = (uresp && (uresp as any).data) || null;
            if (udata) {
              const current = useVoiceStore.getState().users;
              const updated = current.map((u) => (String(u.userId) === String(from) ? { ...u, username: udata.username || udata.firstname || udata.name } : u));
              if (!updated.some((u) => String(u.userId) === String(from))) updated.push({ userId: String(from), username: udata.username || udata.firstname || udata.name });
              setUsers(updated);
            }
          } catch (e) {}
          if (!pcRefs.current[from]) {
            const pc = new RTCPeerConnection();
            pcRefs.current[from] = pc;
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
            pc.ontrack = (ev) => {
              const remoteStream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
              let audioEl = audioElsRef.current[from];
              if (!audioEl) {
                audioEl = document.createElement('audio');
                audioEl.autoplay = true;
                audioEl.setAttribute('playsinline', '');
                audioEl.style.display = 'none';
                document.body.appendChild(audioEl);
                audioElsRef.current[from] = audioEl;
              }
              audioEl.srcObject = remoteStream;
              audioEl.play().catch((err) => {
                console.warn('audio play blocked', err);
                try { setAudioBlocked(true); } catch {}
              });
              addUser(String(from));
            };
            pc.onicecandidate = (e) => { if (e.candidate) { try { sendSafe({ type: 'ice', candidate: e.candidate, to: from }); } catch {} } };
            if (String(user.id) > String(from)) {
              try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                try { sendSafe({ type: 'sdp', sdp: offer, to: from }); } catch {}
              } catch (e) { console.error(e); }
            }
          }
          return;
        }
        if (msg.type === 'sdp' && msg.sdp && from) {
          if (!pcRefs.current[from]) {
            const pc = new RTCPeerConnection();
            pcRefs.current[from] = pc;
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
            pc.ontrack = (ev) => {
              const remoteStream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
              let audioEl = audioElsRef.current[from];
              if (!audioEl) {
                audioEl = document.createElement('audio');
                audioEl.autoplay = true;
                audioEl.setAttribute('playsinline', '');
                audioEl.style.display = 'none';
                document.body.appendChild(audioEl);
                audioElsRef.current[from] = audioEl;
              }
              audioEl.srcObject = remoteStream;
              audioEl.play().catch((err) => {
                console.warn('audio play blocked', err);
                try { setAudioBlocked(true); } catch {}
              });
              addUser(String(from));
            };
            pc.onicecandidate = (e) => { if (e.candidate) { try { conn.send(JSON.stringify({ type: 'ice', candidate: e.candidate, to: from })); } catch {} } };
          }
          const pc = pcRefs.current[from];
          const remoteDesc = new RTCSessionDescription(msg.sdp);
          await pc.setRemoteDescription(remoteDesc);
          if (remoteDesc.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            try { conn.send(JSON.stringify({ type: 'sdp', sdp: answer, to: from })); } catch {}
          }
          return;
        }
        if (msg.type === 'ice' && msg.candidate && from) {
          const pc = pcRefs.current[from];
          if (pc) { try { await pc.addIceCandidate(msg.candidate); } catch (e) { console.warn(e); } }
          return;
        }
        if (msg.type === 'activity' && from) {
          try { setSpeaking && setSpeaking(String(from), !!msg.active); } catch {}
          addUser(String(from));
          try {
            const uresp = await generatedApi.usersIdGet(String(from));
            const udata = (uresp && (uresp as any).data) || null;
            if (udata) {
              const current = useVoiceStore.getState().users;
              const updated = current.map((u) => (String(u.userId) === String(from) ? { ...u, username: udata.username || udata.firstname || udata.name } : u));
              if (!updated.some((u) => String(u.userId) === String(from))) updated.push({ userId: String(from), username: udata.username || udata.firstname || udata.name });
              setUsers(updated);
            }
          } catch (e) {}
          return;
        }
        if (msg.type === 'user-left' && msg.userId) {
          removeUser(String(msg.userId));
          return;
        }
      } catch (e) { console.error('ws msg parse', e); }
    };

    conn.onclose = () => {
      setJoined(false);
      setWs(undefined);
      try {
        // stop vad
        try { vadRunning = false; } catch {}
        Object.values(pcRefs.current).forEach((p) => { try { p.close(); } catch {} });
        pcRefs.current = {};
        if (localStreamRef.current) { localStreamRef.current.getTracks().forEach((t) => t.stop()); localStreamRef.current = null; }
        Object.values(audioElsRef.current).forEach((el) => { try { el.pause(); if (el.parentNode) el.parentNode.removeChild(el); } catch {} });
        audioElsRef.current = {};
      } catch {}
    };
  };

  // auto-join
  useEffect(() => { if (autoJoin && selectedRoomId && !joined) doJoin(); }, [autoJoin, selectedRoomId]);

  // Auto-join fallback: sometimes parent sets the selected room after this
  // component mounts. If autoJoin is requested but we didn't join yet, wait
  // a short while for `selectedRoomId` and try joining automatically.
  useEffect(() => {
    if (!autoJoin) return;
    if (joined || ws) return;
    let mounted = true;
    const start = Date.now();
    const tryJoin = () => {
      if (!mounted) return;
      if (joined || ws) return;
      if (selectedRoomId) {
        doJoin();
        return;
      }
      if (Date.now() - start > 3000) return; // stop after 3s
      setTimeout(tryJoin, 200);
    };
    tryJoin();
    return () => { mounted = false; };
  }, [autoJoin]);

  const doLeave = () => {
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'call-ended', roomId: selectedRoomId })); } catch {}
      }
    } catch {}
    if (ws) { try { ws.close(); } catch {} setWs(undefined); }
    setJoined(false);
    onCallEnded && onCallEnded();
  };

  const displayName = (id: string) => {
    const found = users.find((u) => String(u.userId) === String(id));
    if (found && (found as any).username) return (found as any).username;
    if (user && String(user.id) === id) return (user as any).username || id;
    return id;
  };

  const userCount = users.length;
  const cols = userCount <= 1 ? 1 : Math.ceil(Math.sqrt(userCount));

  return (
    <div className="w-full h-full p-2">
      {audioBlocked && (
        <div className="fixed left-1/2 -translate-x-1/2 top-20 z-50">
          <div className="border border-yellow-600 rounded-lg bg-yellow-900/95 p-3 shadow-lg text-yellow-200">
            <div className="mb-2 text-sm">Audio playback blocked by browser. Click to enable audio.</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-yellow-600 text-black" onClick={async () => {
                try {
                  Object.values(audioElsRef.current).forEach((el) => { try { el.play().catch(() => {}); } catch {} });
                  const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
                  if (AudioCtx) { try { const ctx = new AudioCtx(); await ctx.resume().catch(() => {}); } catch {} }
                  setAudioBlocked(false);
                } catch (e) { console.warn('enable audio failed', e); }
              }}>Enable audio</button>
            </div>
          </div>
        </div>
      )}
      {!joined && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-lg font-semibold">Not joined to room</p>
          <Button size="lg" onClick={() => doJoin()} disabled={!selectedRoomId || !user?.id}>Join</Button>
        </div>
      )}

      {joined && (
        <div className="h-full w-full flex flex-col">
          <div className="flex justify-end mb-2">
            <Button variant="ghost" onClick={doLeave}>End Call</Button>
          </div>

          <div className="grid gap-4 w-full h-full items-stretch overflow-auto" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: '1fr' }}>
            {users.map((u) => (
              <div key={u.userId} className="flex flex-col items-center justify-center w-full h-full p-2">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full" style={{ maxWidth: 'clamp(120px, 30vmin, 360px)' }}>
                    <div className="aspect-square w-full flex items-center justify-center">
                      <Avatar className={`w-full h-full ${speaking && speaking[String(u.userId)] ? 'ring-4 ring-green-400' : ''}`}>
                        <AvatarFallback>{String(u.userId).slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-center break-words">{displayName(u.userId)}</div>
              </div>
            ))}
            {users.length === 0 && (<div className="text-muted-foreground">No users in room yet</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
