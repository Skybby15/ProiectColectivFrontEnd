import { createOrGetAudioElement, assignRemoteStreamToAudio, tryPlayAudioElement } from './audioUtils';

export function ensurePeerConnectionForReady(from: string, ctx: any) {
  const { pcRefs, pcOfferTimersRef, localStreamRef, audioElsRef, audioCtxRef, conn, user, addUser, fetchAndUpdateUserInfo, setUsers, setSpeaking } = ctx;
  if (pcRefs[from]) return pcRefs[from];

  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  // set a fallback timer: if the other side doesn't send SDP, create an offer after a short delay
  try { if (pcOfferTimersRef[from]) { clearTimeout(pcOfferTimersRef[from]); } } catch {}
  pcOfferTimersRef[from] = window.setTimeout(async () => {
    try {
      const existingPc = pcRefs[from];
      if (!existingPc) return;
      // skip creating an offer if the peer connection is closed/failed
      try {
        if (existingPc.signalingState === 'closed' || existingPc.connectionState === 'closed' || existingPc.connectionState === 'failed') {
          try { delete pcOfferTimersRef[from]; } catch {}
          return;
        }
      } catch (e) {}
      const hasRemote = !!existingPc.remoteDescription;
      if (!hasRemote) {
        try {
          const offer = await existingPc.createOffer();
          await existingPc.setLocalDescription(offer);
          try { conn.send(JSON.stringify({ type: 'sdp', sdp: offer, to: from })); } catch (err) { console.warn('fallback send sdp failed', err); }
        } catch (err) {
          console.warn('fallback offer failed', err);
        }
      }
    } catch (e) { console.warn('fallback offer failed', e); }
  }, 700);

  pcRefs[from] = pc;

  // localStreamRef is a ref object, access .current for the actual stream
  const stream = localStreamRef?.current;
  if (stream) {
    try {
      stream.getTracks().forEach((t: MediaStreamTrack) => {
        try { pc.addTrack(t, stream); } catch (e) {}
      });
    } catch {}
  }

  pc.ontrack = (ev: any) => {
    try {
      const remoteStream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
      console.debug('[voicePcManager] ontrack', { from, tracks: remoteStream.getTracks().map((t: any) => ({ kind: t.kind, enabled: t.enabled })) });
      const audioEl = createOrGetAudioElement(from, audioElsRef);
      if (!audioEl) console.warn('[voicePcManager] audioEl missing for', from);
      assignRemoteStreamToAudio(audioEl, remoteStream);
      tryPlayAudioElement(audioEl, audioCtxRef).then((ok) => {
        if (!ok) console.error('[voicePcManager] audio play failed for', from, { audioElId: audioEl?.id });
        else console.debug('[voicePcManager] audio playing for', from);
      }).catch((e) => { console.error('[voicePcManager] tryPlayAudioElement threw', e); });
      addUser(String(from));
    } catch (e) {
      console.error('[voicePcManager] ontrack handler failed', e);
    }
  };

  pc.onicecandidate = (e: any) => { if (e.candidate) { try { conn.send(JSON.stringify({ type: 'ice', candidate: e.candidate, to: from })); } catch (err) { console.warn('send ice failed', err); } } };
  pc.oniceconnectionstatechange = () => { try { console.log('iceConnectionState for', from, pc.iceConnectionState); if (pc.iceConnectionState === 'closed' || pc.iceConnectionState === 'failed') { try { if (pcOfferTimersRef[from]) { clearTimeout(pcOfferTimersRef[from]); delete pcOfferTimersRef[from]; } } catch {} } } catch {} };
  pc.onconnectionstatechange = () => {
    try {
      console.log('connectionState for', from, pc.connectionState);
      if (pc.connectionState === 'closed' || pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        try { if (pcOfferTimersRef[from]) { clearTimeout(pcOfferTimersRef[from]); delete pcOfferTimersRef[from]; } } catch {}
      }
      // Try ICE restart / renegotiation on transient failures
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        (async () => {
          try {
            console.debug('[voicePcManager] attempting iceRestart for', from, { state: pc.connectionState });
            if (pc.signalingState !== 'closed') {
              try {
                const offer = await pc.createOffer({ iceRestart: true } as any);
                await pc.setLocalDescription(offer);
                try { conn.send(JSON.stringify({ type: 'sdp', sdp: offer, to: from })); } catch (err) { console.warn('send sdp (iceRestart) failed', err); }
              } catch (e) { console.warn('[voicePcManager] iceRestart createOffer/setLocalDescription failed for', from, e); }
            } else {
              console.warn('[voicePcManager] cannot iceRestart, pc signalingState closed for', from);
            }
          } catch (e) { console.warn('[voicePcManager] iceRestart failed for', from, e); }
        })();
      }
    } catch {}
  };

  // If this client should create the offer deterministically, do it now
  try {
    if (String(ctx.user.id) > String(from)) {
      (async () => {
        try {
          // ensure pc is not closed before creating offer
          if (pc.signalingState === 'closed' || pc.connectionState === 'closed' || pc.connectionState === 'failed') {
            console.warn('skipping deterministic offer: pc closed/failed for', from);
            return;
          }
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          try { conn.send(JSON.stringify({ type: 'sdp', sdp: offer, to: from })); } catch (err) { console.warn('send sdp offer failed', err); }
          try { if (pcOfferTimersRef[from]) { clearTimeout(pcOfferTimersRef[from]); delete pcOfferTimersRef[from]; } } catch {}
        } catch (e) { console.error('offer creation error', e); }
      })();
    }
  } catch (e) {}

  return pc;
}

export async function handleSdpMessage(from: string, sdp: any, ctx: any) {
  const { pcRefs, localStreamRef, pcOfferTimersRef, conn, audioElsRef, audioCtxRef, addUser } = ctx;
  // localStreamRef is a ref object, access .current for the actual stream
  const stream = localStreamRef?.current;
  try { if (pcOfferTimersRef[from]) { clearTimeout(pcOfferTimersRef[from]); delete pcOfferTimersRef[from]; } } catch {}
  // recreate PC if missing or closed to handle late-arriving SDP/ICE
  if (!pcRefs[from] || (pcRefs[from] && (pcRefs[from].signalingState === 'closed' || pcRefs[from].connectionState === 'closed'))) {
    if (pcRefs[from]) {
      try { console.debug('[voicePcManager] recreating closed pc for', from); } catch {}
      try { pcRefs[from].close(); } catch {}
      try { delete pcRefs[from]; } catch {}
    }
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRefs[from] = pc;
    if (stream) try { stream.getTracks().forEach((t: MediaStreamTrack) => pc.addTrack(t, stream)); } catch {}
    pc.ontrack = (ev: any) => {
      try {
        const remoteStream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
        const audioEl = createOrGetAudioElement(from, audioElsRef);
        assignRemoteStreamToAudio(audioEl, remoteStream);
        tryPlayAudioElement(audioEl, audioCtxRef).then((ok) => { if (!ok) console.error('audio play failed for', from); else console.debug('[voicePcManager] audio playing for', from); });
        addUser(String(from));
      } catch (e) { console.error('[voicePcManager] pc.ontrack failed', e); }
    };
    pc.onicecandidate = (e: any) => { if (e.candidate) { try { conn.send(JSON.stringify({ type: 'ice', candidate: e.candidate, to: from })); } catch (err) { console.warn('send ice failed', err); } } };
    pc.oniceconnectionstatechange = () => { try { console.log('iceConnectionState (sdp path) for', from, pc.iceConnectionState); } catch {} };
    pc.onconnectionstatechange = () => { try { console.log('connectionState (sdp path) for', from, pc.connectionState); } catch {} };
  }
  const pc = pcRefs[from];
  const remoteDesc = new RTCSessionDescription(sdp);
  try {
    await pc.setRemoteDescription(remoteDesc);
  } catch (e) {
    console.warn('[voicePcManager] setRemoteDescription failed, attempting PC recreate for', from, e);
    // Try to recreate PC and apply remote description again
    try {
      try { pcRefs[from].close(); } catch {}
      try { delete pcRefs[from]; } catch {}
      const newPc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRefs[from] = newPc;
      if (stream) try { stream.getTracks().forEach((t: MediaStreamTrack) => newPc.addTrack(t, stream)); } catch {}
      newPc.ontrack = (ev: any) => {
        const remoteStream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
        const audioEl = createOrGetAudioElement(from, audioElsRef);
        assignRemoteStreamToAudio(audioEl, remoteStream);
        tryPlayAudioElement(audioEl, audioCtxRef).then((ok) => { if (!ok) console.error('audio play failed for', from); });
        addUser(String(from));
      };
      newPc.onicecandidate = (e: any) => { if (e.candidate) { try { conn.send(JSON.stringify({ type: 'ice', candidate: e.candidate, to: from })); } catch (err) { console.warn('send ice failed', err); } } };
      newPc.oniceconnectionstatechange = () => { try { console.log('iceConnectionState (sdp path) for', from, newPc.iceConnectionState); } catch {} };
      newPc.onconnectionstatechange = () => { try { console.log('connectionState (sdp path) for', from, newPc.connectionState); } catch {} };
      await newPc.setRemoteDescription(remoteDesc);
    } catch (e2) {
      console.error('[voicePcManager] recreate+setRemoteDescription failed for', from, e2);
      throw e2;
    }
  }
  if (remoteDesc.type === 'offer') {
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    try { conn.send(JSON.stringify({ type: 'sdp', sdp: answer, to: from })); } catch (err) { console.warn('send sdp answer failed', err); }
    try { if (pcOfferTimersRef[from]) { clearTimeout(pcOfferTimersRef[from]); delete pcOfferTimersRef[from]; } } catch {}
  }
}

export async function addIceCandidateToPc(from: string, candidate: any, ctx: any) {
  const { pcRefs } = ctx;
  let pc = pcRefs[from];
  if (!pc) return;
  try {
    // if the pc is closed, try to recreate it so we can add candidate
    if (pc.signalingState === 'closed' || pc.connectionState === 'closed') {
      console.debug('[voicePcManager] addIceCandidateToPc: pc closed, recreating for', from);
      try { pc.close(); } catch {}
      try { delete pcRefs[from]; } catch {}
      pc = undefined as any;
      return; // candidates without remote description will be ignored; remote will resend ICE or renegotiate
    }
    await pc.addIceCandidate(candidate);
  } catch (e) { console.warn('addIceCandidate failed for', from, e); }
}
