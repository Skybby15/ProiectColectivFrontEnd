export function createOrGetAudioElement(userId: string, audioElsRef: Record<string, HTMLAudioElement>) {
  let audioEl = audioElsRef[userId];
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.muted = true;
    audioEl.volume = 1.0;
    audioEl.setAttribute('playsinline', '');
    audioEl.style.display = 'none';
    try { document.body.appendChild(audioEl); } catch (e) { /* ignore in non-DOM env */ }
    audioElsRef[userId] = audioEl;
  }
  return audioEl;
}

export async function tryPlayAudioElement(audioEl: HTMLAudioElement, audioCtxRef?: { current: any } | null, retries = 10, delay = 150) {
  try {
    if (audioCtxRef && audioCtxRef.current) {
      try { await audioCtxRef.current.resume(); } catch {}
    }
  } catch {}
  for (let i = 0; i < retries; i++) {
    try {
      const playPromise = audioEl.play();
      if (playPromise) await playPromise;
      try { audioEl.muted = false; } catch {}
      return true;
    } catch (err) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return false;
}

export function assignRemoteStreamToAudio(audioEl: HTMLAudioElement, remoteStream: MediaStream) {
  try { audioEl.srcObject = remoteStream; } catch (e) { try { (audioEl as any).srcObject = remoteStream; } catch {} }
}
