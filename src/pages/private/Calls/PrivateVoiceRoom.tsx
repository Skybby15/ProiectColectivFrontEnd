import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useVoiceStore } from "@/services/stores/useVoiceStore";
// buildJoinWsUrl removed; use centralized signaling helper instead
import { useAuthStore } from "@/services/stores/useAuthStore";
import { DefaultApi } from "@/api";
import { makeApi, stopAllRemoteAudio } from '@/services/react-query/voiceHelpers';
import { sanitizeName } from './privateVoiceUtils';
import { createSignalingConnection } from '@/services/react-query/voiceSignaling';
import { Monitor, MonitorOff, Mic, MicOff } from "lucide-react";

export function PrivateVoiceRoom({ autoJoin, onCallEnded }: { autoJoin?: boolean, onCallEnded?: () => void } = { autoJoin: false }) {
  const { selectedRoomId, users, addUser, removeUser, setWs, ws, setUsers, setSpeaking, speaking, presenterId, setPresenterId, screenStream, setScreenStream, isMuted, setIsMuted } = useVoiceStore();
  const { user, token } = useAuthStore();
  const [joined, setJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const pcRefs = useRef<Record<string, RTCPeerConnection>>({});
  const pcOfferTimersRef = useRef<Record<string, number>>({});
  const cleanupTimerRef = useRef<number | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<any | null>(null);
  const audioElsRef = useRef<Record<string, HTMLAudioElement>>({});
  
  // Screen share refs
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenPcRef = useRef<RTCPeerConnection | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const screenPcsRef = useRef<Record<string, RTCPeerConnection>>({});
  
  // WebSocket ref to avoid stale closure issues
  const wsRef = useRef<WebSocket | undefined>(undefined);

  // stopAllRemoteAudio provided by voiceHelpers
  
  // Create API instance for fetching user data
  const apiRef = useRef<DefaultApi | null>(null);
  useEffect(() => {
    if (token) {
      apiRef.current = makeApi(token);
      console.log('[PrivateVoice] API configured via voiceHelpers');
    }
  }, [token]);

  useEffect(() => {
    wsRef.current = ws;
    if (!ws) setJoined(false);
  }, [ws]);

  

  // fetchAndUpdateUserInfo provided by voiceHelpers

  useEffect(() => {
    // cleanup when switching rooms: schedule a delayed cleanup (grace) so quick rejoin can reuse streams
    setUsers([]);
    setJoined(false);
    setPresenterId(undefined);
    setScreenStream(undefined);
    if (ws) { try { ws.close(); } catch {} setWs(undefined); }
    try {
      stopAllRemoteAudio(audioElsRef.current, true);
      try { if (cleanupTimerRef.current) { clearTimeout(cleanupTimerRef.current); } } catch {}
      cleanupTimerRef.current = window.setTimeout(() => {
        try {
          Object.values(pcRefs.current).forEach((p) => { try { p.close(); } catch {} });
          pcRefs.current = {};
          try { Object.values(audioElsRef.current).forEach((el) => { try { el.pause(); } catch {} }); } catch {}
        } catch (e) { console.warn('[PrivateVoice] delayed cleanup failed', e); }
        cleanupTimerRef.current = null;
      }, 4000);
    } catch {}
  }, [selectedRoomId]);

  const doJoin = async () => {
    console.log('[PrivateVoice] doJoin triggered', { selectedRoomId, userId: user?.id });
    if (isJoining) {
      console.debug('[PrivateVoice] already joining, ignoring duplicate call');
      return;
    }
    if (!selectedRoomId || !user?.id) {
      console.warn('[PrivateVoice] doJoin aborted - missing roomId or user');
      return;
    }
    setIsJoining(true);
    
    // Ensure a single AudioContext instance and resume it on user gesture to allow autoplay
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        try { await audioCtxRef.current.resume(); } catch {}
        try {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          gain.gain.value = 0;
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          setTimeout(() => { try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch {} }, 50);
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
    
    // use shared signaling setup to keep technical logic out of the UI component
    try {
      createSignalingConnection({
        selectedRoomId: selectedRoomId as string,
        userId: user.id as string,
        authUser: user,
        token: token,
        setWs: setWs,
        setJoined: setJoined,
        setUsers: setUsers,
        setSpeaking: setSpeaking,
        setPresenterId: setPresenterId,
        setIsMuted: setIsMuted,
        addUser: addUser,
        removeUser: removeUser,
        pcRefs: pcRefs.current,
        pcOfferTimersRef: pcOfferTimersRef.current,
        localStreamRef: localStreamRef,
        audioElsRef: audioElsRef.current,
        audioCtxRef: audioCtxRef,
        apiRef: apiRef,
        onCallEnded: onCallEnded,
        screenVideoRef: screenVideoRef,
        screenPcRef: screenPcRef,
        screenPcsRef: screenPcsRef,
        setScreenStream: setScreenStream,
        onScreenShareSubscribe: handleScreenShareSubscribe,
      });
    } catch (e) { console.error('[PrivateVoice] createSignalingConnection failed', e); setIsJoining(false); }
  };

  useEffect(() => { if (autoJoin && selectedRoomId && !joined) doJoin(); }, [autoJoin, selectedRoomId]);

  // Handle when a viewer subscribes to our screen share
  const handleScreenShareSubscribe = (viewerId: string) => {
    console.log('[PrivateVoice] Viewer subscribed to screen share:', viewerId);
    createScreenPcForViewer(viewerId);
  };

  // Toggle mute - request mic access when unmuting
  const toggleMute = async () => {
    if (isMuted) {
      // Check if we already have a stream with audio tracks
      if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
        // Just re-enable the existing tracks
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
        setIsMuted(false);
        console.log('[PrivateVoice] Microphone re-enabled (existing stream)');
      } else {
        // Request new microphone access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          setIsMuted(false);
          console.log('[PrivateVoice] Microphone enabled (new stream)');
          
          // Add tracks to existing peer connections
          Object.values(pcRefs.current).forEach(pc => {
            stream.getAudioTracks().forEach(track => {
              try {
                pc.addTrack(track, stream);
              } catch (e) {
                console.warn('[PrivateVoice] Failed to add track to PC', e);
              }
            });
          });
        } catch (e) {
          console.error('[PrivateVoice] Failed to get microphone access', e);
        }
      }
    } else {
      // Mute - just disable tracks, don't stop them
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
      setIsMuted(true);
      console.log('[PrivateVoice] Microphone muted');
    }
  };

  const doLeave = () => {
    // Stop screen sharing if active
    if (isScreenSharing) {
      stopScreenShare();
    }
    try {
      if (onCallEnded) { onCallEnded(); return; }
    } catch (e) {}
    if (ws) { try { ws.close(); } catch {} setWs(undefined); }
    try { stopAllRemoteAudio(audioElsRef.current, true); } catch {}
    try { setUsers([]); } catch {}
    setPresenterId(undefined);
    setScreenStream(undefined);
    setJoined(false);
  };

  // Effect to show presenter's own screen in the video element
  useEffect(() => {
    if (isScreenSharing && localScreenStreamRef.current && screenVideoRef.current) {
      console.log('[PrivateVoice] Setting presenter local screen on video element');
      screenVideoRef.current.srcObject = localScreenStreamRef.current;
      screenVideoRef.current.play().catch(e => console.warn('[PrivateVoice] presenter video play failed', e));
    }
  }, [isScreenSharing, presenterId]);

  // Start screen sharing
  const startScreenShare = async () => {
    if (!wsRef.current || !user?.id) return;
    
    // Check if someone else is already presenting
    if (presenterId && presenterId !== String(user.id)) {
      console.warn('[PrivateVoice] Another user is already presenting');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      
      localScreenStreamRef.current = stream;
      setIsScreenSharing(true);
      
      // Listen for when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      // Notify server we're starting screen share
      wsRef.current.send(JSON.stringify({ type: 'screenshare-start' }));
      console.log('[PrivateVoice] Sent screenshare-start');
      
      // Show our own screen in the video element
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(e => console.warn('[PrivateVoice] video play failed', e));
      }
      setScreenStream(stream);
      
    } catch (e) {
      console.error('[PrivateVoice] Failed to start screen share', e);
      setIsScreenSharing(false);
    }
  };
  
  // Create a peer connection for screen sharing to a specific user
  const createScreenPcForViewer = async (viewerId: string) => {
    const currentWs = wsRef.current;
    console.log('[PrivateVoice] createScreenPcForViewer called for:', viewerId, 'ws:', !!currentWs, 'stream:', !!localScreenStreamRef.current);
    
    if (!currentWs || !localScreenStreamRef.current) {
      console.warn('[PrivateVoice] Cannot create PC - ws or stream missing');
      return;
    }
    
    const stream = localScreenStreamRef.current;
    
    try {
      if (screenPcsRef.current[viewerId]) {
        console.log('[PrivateVoice] Already have PC for viewer', viewerId);
        return;
      }
      
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      screenPcsRef.current[viewerId] = pc;
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      pc.onicecandidate = (ev) => {
        if (ev.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({ type: 'ice-candidate', candidate: ev.candidate, to: viewerId }));
        }
      };
      
      pc.onconnectionstatechange = () => {
        console.log('[PrivateVoice] Presenter PC connection state for', viewerId, ':', pc.connectionState);
      };
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription, to: viewerId }));
        console.log('[PrivateVoice] Presenter sent offer to viewer', viewerId);
      }
      
    } catch (e) {
      console.error('[PrivateVoice] Failed to create screen PC for viewer', viewerId, e);
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach(track => track.stop());
      localScreenStreamRef.current = null;
    }
    
    Object.values(screenPcsRef.current).forEach(pc => {
      try { pc.close(); } catch {}
    });
    screenPcsRef.current = {};
    
    setIsScreenSharing(false);
    setScreenStream(undefined);
    
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'screenshare-stop' }));
    }
  };

  const displayName = (id: string) => {
    const found = users.find((u) => String(u.userId) === String(id));
    if (found && (found as any).username) return sanitizeName((found as any).username, id);
    if (user && String(user.id) === id) return (user as any).username || id;
    return id;
  };

  // Get presenter's display name
  const presenterName = presenterId ? displayName(presenterId) : '';
  const isPresenting = presenterId && presenterId !== '';
  const iAmPresenter = presenterId === String(user?.id);
  const canStartScreenShare = !presenterId || iAmPresenter;

  const userCount = users.length;
  const cols = userCount <= 1 ? 1 : Math.ceil(Math.sqrt(userCount));

  return (
    <div className="w-full h-full p-2">
      {!joined && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-lg font-semibold">Not joined to call</p>
          <Button size="lg" onClick={() => doJoin()} disabled={!selectedRoomId || !user?.id || isJoining}>{isJoining ? 'Joining…' : 'Join Call'}</Button>
        </div>
      )}

      {joined && (
        <div className="h-full w-full flex flex-col">
          {/* Header with controls */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {/* Mute/Unmute button */}
              <Button 
                variant={isMuted ? "outline" : "default"} 
                size="sm"
                onClick={toggleMute}
                className="flex items-center gap-2"
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Mute
                  </>
                )}
              </Button>
              
              {/* Screen share button */}
              {canStartScreenShare ? (
                <Button 
                  variant={isScreenSharing ? "destructive" : "outline"} 
                  size="sm"
                  onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  className="flex items-center gap-2"
                >
                  {isScreenSharing ? (
                    <>
                      <MonitorOff className="w-4 h-4" />
                      Stop Sharing
                    </>
                  ) : (
                    <>
                      <Monitor className="w-4 h-4" />
                      Share Screen
                    </>
                  )}
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {presenterName} is presenting
                </span>
              )}
            </div>
            <Button variant="ghost" onClick={doLeave}>Leave</Button>
          </div>
          
          {/* Main content area - screen share layout */}
          {isPresenting ? (
            <div className="flex-1 flex gap-4 min-h-0">
              {/* Left side - Screen share video */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={screenVideoRef}
                    autoPlay 
                    playsInline
                    muted={iAmPresenter}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {!screenStream && !iAmPresenter && !isScreenSharing && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <p>Waiting for screen share...</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-center text-muted-foreground">
                  {iAmPresenter ? 'You are presenting' : `${presenterName} is presenting`}
                </div>
              </div>
              
              {/* Right side - Participants */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
                <div className="text-sm font-semibold mb-2">Participants ({users.length})</div>
                {users.map((u) => (
                  <div key={u.userId} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Avatar className={`w-10 h-10 ${speaking && speaking[String(u.userId)] ? 'ring-2 ring-green-400' : ''}`}>
                      <AvatarFallback>{String(u.userId).slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{displayName(u.userId)}</div>
                      {presenterId === String(u.userId) && (
                        <div className="text-xs text-muted-foreground">Presenting</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Normal grid layout when no screen share */
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
              {users.length === 0 && (<div className="text-muted-foreground">No users in call yet</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
