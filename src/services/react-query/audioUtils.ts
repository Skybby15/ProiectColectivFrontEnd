export function createOrGetAudioElement(userId: string, audioEls: Record<string, HTMLAudioElement>) {
  let audioEl = audioEls[userId];
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.muted = true;
    audioEl.volume = 1.0;
    audioEl.setAttribute('playsinline', '');
    audioEl.style.display = 'none';
    try {
      audioEl.id = `remote-audio-${userId}`;
      audioEl.dataset.userId = String(userId);
      document.body.appendChild(audioEl);
      console.debug('[audioUtils] created audio element', { id: audioEl.id, userId });
    } catch (e) { console.warn('[audioUtils] append audio failed', e); }
    audioEls[userId] = audioEl;
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
      // Ensure muted is true while attempting autoplay so browsers allow play()
      try { audioEl.muted = true; } catch {}
      const playPromise = audioEl.play();
      if (playPromise) await playPromise;
      try {
        // Unmute slightly delayed to avoid short hiccups when the stream is being renegotiated
        const unmuteDelay = 220;
        const prevMuted = audioEl.muted;
        try { audioEl.muted = true; } catch {}
        setTimeout(() => {
          try { audioEl.muted = false; audioEl.volume = audioEl.volume ?? 1.0; } catch {}
        }, unmuteDelay);
        console.debug('[audioUtils] play succeeded (will unmute after delay)', { id: audioEl.id || null, wasMuted: prevMuted, unmuteDelay });
      } catch {}
      return true;
    } catch (err) {
      console.warn('[audioUtils] play() attempt failed', { attempt: i, error: err });
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
  // Final failure: present a user gesture fallback so user can enable audio explicitly
  try {
    showEnableAudioButton(audioCtxRef);
  } catch (e) {}
  return false;
}

function showEnableAudioButton(audioCtxRef?: { current: any } | null) {
  try {
    if (document.getElementById('enable-audio-button')) return;
    const btn = document.createElement('button');
    btn.id = 'enable-audio-button';
    btn.textContent = 'Enable audio';
    btn.style.position = 'fixed';
    btn.style.right = '12px';
    btn.style.bottom = '12px';
    btn.style.zIndex = '999999';
    btn.style.padding = '8px 12px';
    btn.style.background = '#0ea5e9';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    btn.onclick = async () => {
      try {
        if (audioCtxRef && audioCtxRef.current) {
          try { await audioCtxRef.current.resume(); } catch (e) { console.warn('audioCtx resume failed', e); }
        }
        const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
        for (const a of audios) {
          try {
            a.muted = true;
            const p = a.play();
            if (p) await p;
            a.muted = false;
          } catch (e) { console.warn('enable-audio play failed for', a.id, e); }
        }
      } catch (e) { console.error('enable-audio handler failed', e); }
      try { btn.remove(); } catch {}
    };
    document.body.appendChild(btn);
  } catch (e) { console.warn('showEnableAudioButton failed', e); }
}

export function assignRemoteStreamToAudio(audioEl: HTMLAudioElement, remoteStream: MediaStream) {
  try { audioEl.srcObject = remoteStream; } catch (e) { try { (audioEl as any).srcObject = remoteStream; } catch {} }
}
