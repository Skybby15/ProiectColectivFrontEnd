import { fetchAndUpdateUserInfo, stopAllRemoteAudio, normalizeRoomUsers } from './voiceHelpers';
import { useVoiceStore } from '@/services/stores/useVoiceStore';
import { ensurePeerConnectionForReady, handleSdpMessage, addIceCandidateToPc } from './voicePcManager';
import { buildJoinWsUrl } from './voice';

export function createSignalingConnection(params: {
  selectedRoomId: string;
  userId: string | number;
  token?: string | null;
  authUser?: any | null;
  setWs: (ws?: WebSocket) => void;
  setJoined: (v: boolean) => void;
  setUsers: (u: any[]) => void;
  setSpeaking?: (id: string, val: boolean) => void;
  setPresenterId?: (id?: string) => void;
  setIsMuted?: (v: boolean) => void;
  addUser: (u: any) => void;
  removeUser: (id: string) => void;
  pcRefs: Record<string, RTCPeerConnection>;
  pcOfferTimersRef: Record<string, number>;
  localStreamRef: { current: MediaStream | null };
  audioElsRef: Record<string, HTMLAudioElement>;
  audioCtxRef: { current: any } | null;
  apiRef: { current: any } | null;
  onCallEnded?: () => void;
  screenVideoRef?: { current: HTMLVideoElement | null };
  screenPcRef?: { current: RTCPeerConnection | null };
  screenPcsRef?: { current: Record<string, RTCPeerConnection> };
  setScreenStream?: (stream?: MediaStream) => void;
  onScreenShareSubscribe?: (viewerId: string) => void;
}) {
  const { selectedRoomId, userId, token, authUser, setWs, setJoined, setUsers, setSpeaking, setPresenterId, setIsMuted, addUser, removeUser, pcRefs, pcOfferTimersRef, localStreamRef, audioElsRef, audioCtxRef, apiRef, onCallEnded, screenVideoRef, screenPcRef, screenPcsRef, setScreenStream, onScreenShareSubscribe } = params;
  console.log('[voiceSignaling] createSignalingConnection params:', { selectedRoomId, userId, token });
  // Build a join URL that matches backend route: /voice/join/{roomId}?userId={userId}
  const base = buildJoinWsUrl(String(selectedRoomId), String(userId));
  const url = token ? `${base}&token=${encodeURIComponent(token)}` : base;
  console.log('[voiceSignaling] connecting to ws url=', url);
  let conn: WebSocket | null = null;
  try {
    conn = new WebSocket(url);
    setWs(conn);
  } catch (err) {
    console.error('[voiceSignaling] WebSocket construction failed', err);
    throw err;
  }

  conn.onerror = (ev) => { console.error('[voiceSignaling] ws error', ev); };

  let vadRunning = false;

  function sendSafe(payload: any) {
    try {
      if (conn && conn.readyState === WebSocket.OPEN) {
        conn.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      }
    } catch {}
  }

  conn.onopen = async () => {
    // Join room immediately, microphone is optional
    setJoined(true);
    const localName = (authUser && (authUser.username || authUser.name)) ? (authUser.username || authUser.name) : `You`;
    addUser({ userId: String(userId), username: localName });
    try { sendSafe({ type: 'ready' }); } catch {}
    
    // Try to get microphone access, but don't block join if denied
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      if (setIsMuted) setIsMuted(false);

      // VAD (Voice Activity Detection)
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
            try { setSpeaking && setSpeaking(String(userId), isSpeaking); } catch {}
            try { sendSafe({ type: 'activity', active: isSpeaking }); } catch {}
          }
          requestAnimationFrame(sample);
        };
        sample();
      } catch (e) { console.warn('[voiceSignaling] VAD setup failed', e); }
    } catch (e) {
      // Microphone access denied - join as muted listener
      console.warn('[voiceSignaling] Microphone access denied, joining as muted', e);
      if (setIsMuted) setIsMuted(true);
    }
  };

  conn.onmessage = async (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'call-ended') {
        try { conn.close(); } catch {}
        setJoined(false);
        setWs(undefined);
        setUsers([]);
        try { if (onCallEnded) onCallEnded(); } catch {}
        return;
      }
      const from = msg.from;
      if (msg.type === 'room-info' && Array.isArray(msg.users)) {
        // normalize and prefer authenticated user's username when present
        const normalized = normalizeRoomUsers(msg.users, authUser || { id: userId });
        setUsers(normalized);
        // Also set the presenterId if present in room-info
        if (setPresenterId) {
          setPresenterId(msg.presenterId || undefined);
        }
        // If there's an active presenter and it's not us, subscribe to their screen share
        if (msg.presenterId && msg.presenterId !== String(userId)) {
          console.log('[voiceSignaling] room-info has presenter, subscribing to:', msg.presenterId);
          sendSafe({ type: 'screenshare-subscribe', to: msg.presenterId });
        }
        normalized.forEach((u: any) => {
          if (String(userId) !== String(u.userId) && (!u.username || u.username === u.userId)) {
            fetchAndUpdateUserInfo(apiRef ? apiRef.current : null, String(u.userId), setUsers);
          }
        });
        return;
      }
      if (msg.type === 'ready' && from) {
        addUser(String(from));
        fetchAndUpdateUserInfo(apiRef ? apiRef.current : null, String(from), setUsers);
        try {
          ensurePeerConnectionForReady(String(from), {
            pcRefs,
            pcOfferTimersRef,
            localStreamRef: localStreamRef,
            audioElsRef,
            audioCtxRef,
            conn,
            user: { id: userId },
            addUser,
            fetchAndUpdateUserInfo,
            setUsers,
            setSpeaking,
          });
        } catch (e) { console.warn('ensurePeerConnectionForReady failed', e); }
        return;
      }
      if (msg.type === 'sdp' && msg.sdp && from) {
        try { await handleSdpMessage(String(from), msg.sdp, { pcRefs, localStreamRef: localStreamRef, pcOfferTimersRef, conn, audioElsRef, audioCtxRef, addUser }); } catch (e) { console.warn('handleSdpMessage failed', e); }
        return;
      }
      if (msg.type === 'ice' && msg.candidate && from) {
        try { await addIceCandidateToPc(String(from), msg.candidate, { pcRefs }); } catch (e) { console.warn('addIceCandidate failed', e); }
        return;
      }
      if (msg.type === 'activity' && from) {
        try { setSpeaking && setSpeaking(String(from), !!msg.active); } catch {}
        addUser(String(from));
        return;
      }
      // Handle screen-state broadcasts from the server
      if (msg.type === 'screen-state') {
        console.log('[voiceSignaling] screen-state received:', msg);
        if (setPresenterId) {
          setPresenterId(msg.presenterId || undefined);
        }
        // If screen sharing is active and we're not the presenter, subscribe
        if (msg.active && msg.presenterId && msg.presenterId !== String(userId)) {
          console.log('[voiceSignaling] Subscribing to presenter:', msg.presenterId);
          sendSafe({ type: 'screenshare-subscribe', to: msg.presenterId });
        }
        // If screen sharing stopped, clear the screen stream
        if (!msg.active && setScreenStream) {
          setScreenStream(undefined);
          if (screenVideoRef?.current) {
            screenVideoRef.current.srcObject = null;
          }
          if (screenPcRef?.current) {
            try { screenPcRef.current.close(); } catch {}
            screenPcRef.current = null;
          }
        }
        return;
      }
      // Handle incoming offer from the presenter (viewer side)
      if (msg.type === 'offer' && msg.sdp && from) {
        console.log('[voiceSignaling] offer received from presenter:', from, 'sdp type:', msg.sdp?.type);
        try {
          // Create a new RTCPeerConnection to receive the screen share
          const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          if (screenPcRef) screenPcRef.current = pc;
          
          pc.ontrack = (ev) => {
            console.log('[voiceSignaling] screen track received, streams:', ev.streams.length);
            if (screenVideoRef?.current && ev.streams[0]) {
              console.log('[voiceSignaling] Setting screen video srcObject');
              screenVideoRef.current.srcObject = ev.streams[0];
              screenVideoRef.current.play().catch(e => console.warn('[voiceSignaling] video play failed', e));
              if (setScreenStream) setScreenStream(ev.streams[0]);
            }
          };
          
          pc.onconnectionstatechange = () => {
            console.log('[voiceSignaling] Viewer screen PC connection state:', pc.connectionState);
          };
          
          pc.onicecandidate = (ev) => {
            if (ev.candidate) {
              sendSafe({ type: 'ice-candidate', candidate: ev.candidate, to: from });
            }
          };
          
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSafe({ type: 'answer', sdp: pc.localDescription, to: from });
          console.log('[voiceSignaling] Viewer sent answer to presenter:', from);
        } catch (e) {
          console.error('[voiceSignaling] offer handling failed', e);
        }
        return;
      }
      // Handle answer from viewer (presenter side)
      if (msg.type === 'answer' && msg.sdp && from) {
        console.log('[voiceSignaling] answer received from viewer:', from);
        try {
          // If we are the presenter, we have multiple PCs (one per viewer)
          const pc = screenPcsRef?.current?.[String(from)];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            console.log('[voiceSignaling] Presenter applied answer from viewer:', from);
          }
        } catch (e) {
          console.error('[voiceSignaling] answer handling failed', e);
        }
        return;
      }
      // Handle ice-candidate
      if (msg.type === 'ice-candidate' && msg.candidate && from) {
        console.log('[voiceSignaling] ice-candidate received from:', from);
        try {
          // Check if we have a PC for this user (as presenter) or use viewer PC
          const pc = screenPcsRef?.current?.[String(from)] || screenPcRef?.current;
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            console.log('[voiceSignaling] Added ICE candidate from:', from);
          }
        } catch (e) {
          console.error('[voiceSignaling] ice-candidate handling failed', e);
        }
        return;
      }
      // Handle screenshare-subscribe from viewer (presenter side)
      if (msg.type === 'screenshare-subscribe' && from) {
        console.log('[voiceSignaling] screenshare-subscribe received from viewer:', from);
        // This will be handled in the component via a callback
        if (onScreenShareSubscribe) {
          onScreenShareSubscribe(String(from));
        }
        return;
      }
      if (msg.type === 'user-left' && msg.userId) {
        try {
          // update store users immediately
          try { removeUser(String(msg.userId)); } catch {}
          try {
            const current = useVoiceStore.getState().users || [];
            const updated = current.filter((u: any) => String(u.userId) !== String(msg.userId));
            setUsers(updated);
          } catch (e) {}
          // clear any remote audio element for that user and speaking flag
          try {
            try { setSpeaking && setSpeaking(String(msg.userId), false); } catch {}
            const audEl = audioElsRef && audioElsRef[String(msg.userId)];
            if (audEl) {
              try { audEl.pause(); } catch {}
              try { audEl.muted = true; } catch {}
              try { (audEl as any).srcObject = null; } catch {}
              try { if (audEl.parentNode) audEl.parentNode.removeChild(audEl); } catch {}
              try { delete audioElsRef[String(msg.userId)]; } catch {}
            }
          } catch (e) { console.warn('[voiceSignaling] cleanup audio on user-left failed', e); }
        } catch (e) { console.warn('[voiceSignaling] user-left handling failed', e); }
        return;
      }
    } catch (e) { console.error('ws msg parse', e); }
  };

  conn.onclose = () => {
    setJoined(false);
    setWs(undefined);
    try { vadRunning = false; } catch {}
    try { stopAllRemoteAudio(audioElsRef, true); } catch {}
    try {
      Object.values(pcRefs).forEach((p) => { try { p.close(); } catch {} });
    } catch (e) {}
  };

  return conn;
}
