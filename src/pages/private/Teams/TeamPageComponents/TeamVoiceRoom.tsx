import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useVoiceStore } from "@/services/stores/useVoiceStore";
// buildJoinWsUrl moved to signaling helper
import { useAuthStore } from "@/services/stores/useAuthStore";
import { DefaultApi } from "@/api";
import { makeApi, stopAllRemoteAudio } from '@/services/react-query/voiceHelpers';
import { createSignalingConnection } from '@/services/react-query/voiceSignaling';
import { Monitor, MonitorOff, Mic, MicOff } from "lucide-react";

export function TeamVoiceRoom({ autoJoin, onCallEnded }: { autoJoin?: boolean, onCallEnded?: () => void } = { autoJoin: false }) {
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

  // Create API instance for fetching user data
  const apiRef = useRef<DefaultApi | null>(null);
  useEffect(() => {
    if (token) {
      apiRef.current = makeApi(token);
      console.log('[TeamVoice] API configured via voiceHelpers');
    }
  }, [token]);

  useEffect(() => {
    wsRef.current = ws;
    if (!ws) setJoined(false);
  }, [ws]);

  useEffect(() => {
    // cleanup when switching rooms: schedule a delayed cleanup (grace) so quick rejoin can reuse streams
    setUsers([]);
    setJoined(false);
    setPresenterId(undefined);
    setScreenStream(undefined);
    if (ws) { try { ws.close(); } catch {} setWs(undefined); }
    try {
      // stop audio immediately for UI correctness while leaving the room
      stopAllRemoteAudio(audioElsRef.current, true);
      try { if (cleanupTimerRef.current) { clearTimeout(cleanupTimerRef.current); } } catch {}
      cleanupTimerRef.current = window.setTimeout(() => {
        try {
          Object.values(pcRefs.current).forEach((p) => { try { p.close(); } catch {} });
          pcRefs.current = {};
          // Keep localStreamRef and audio elements alive across the grace period so quick rejoin can reuse them.
          try { Object.values(audioElsRef.current).forEach((el) => { try { el.pause(); } catch {} }); } catch {}
        } catch (e) { console.warn('[TeamVoice] delayed cleanup failed', e); }
        cleanupTimerRef.current = null;
      }, 4000);
    } catch {}
  }, [selectedRoomId]);

  const doJoin = async () => {
    console.log('[TeamVoice] doJoin triggered', { selectedRoomId, userId: user?.id });
    if (isJoining) {
      console.debug('[TeamVoice] already joining, ignoring duplicate call');
      return;
    }
    if (!selectedRoomId || !user?.id) {
      console.warn('[TeamVoice] doJoin aborted - missing roomId or user');
      return;
    }
    setIsJoining(true);
    // compact: use shared signaling setup to keep technical logic out of the UI component
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
    } catch (e) { console.error('[TeamVoice] createSignalingConnection failed', e); setIsJoining(false); }
  };
  
  // Handle when a viewer subscribes to our screen share
  const handleScreenShareSubscribe = (viewerId: string) => {
    console.log('[TeamVoice] Viewer subscribed to screen share:', viewerId);
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
        console.log('[TeamVoice] Microphone re-enabled (existing stream)');
        return;
      }
      
      // Need to get a new stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        
        // Add the new audio track to all existing peer connections
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          Object.values(pcRefs.current).forEach(pc => {
            try {
              // Check if we already have an audio sender
              const senders = pc.getSenders();
              const audioSender = senders.find(s => s.track?.kind === 'audio');
              if (audioSender) {
                audioSender.replaceTrack(audioTrack);
              } else {
                pc.addTrack(audioTrack, stream);
              }
            } catch (e) {
              console.warn('[TeamVoice] Failed to add track to PC', e);
            }
          });
        }
        
        setIsMuted(false);
        console.log('[TeamVoice] Microphone enabled and added to PCs');
      } catch (e) {
        console.error('[TeamVoice] Failed to get microphone access', e);
        // Stay muted
      }
    } else {
      // Muting - disable mic tracks (don't stop, just disable so we can re-enable later)
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
      setIsMuted(true);
      console.log('[TeamVoice] Microphone muted');
    }
  };

  useEffect(() => {
    if (ws) setIsJoining(false);
  }, [ws]);

  useEffect(() => { if (autoJoin && selectedRoomId && !joined) doJoin(); }, [autoJoin, selectedRoomId]);

  const doLeave = () => {
    // Stop screen sharing if active
    if (isScreenSharing) {
      stopScreenShare();
    }
    // prefer parent callback when provided (caller page will notify peer)
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
  // This runs when isScreenSharing changes OR when presenterId changes (video becomes visible)
  useEffect(() => {
    if (isScreenSharing && localScreenStreamRef.current && screenVideoRef.current) {
      console.log('[TeamVoice] Setting presenter local screen on video element');
      screenVideoRef.current.srcObject = localScreenStreamRef.current;
      screenVideoRef.current.play().catch(e => console.warn('[TeamVoice] presenter video play failed', e));
    }
  }, [isScreenSharing, presenterId]);

  // Start screen sharing
  const startScreenShare = async () => {
    if (!wsRef.current || !user?.id) return;
    
    // Check if someone else is already presenting
    if (presenterId && presenterId !== String(user.id)) {
      console.warn('[TeamVoice] Another user is already presenting');
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
      console.log('[TeamVoice] Sent screenshare-start');
      
      // Show our own screen in the video element
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play().catch(e => console.warn('[TeamVoice] video play failed', e));
        console.log('[TeamVoice] Set local screen stream on video element');
      }
      setScreenStream(stream);
      
      // Don't create PCs here - wait for viewers to subscribe
      
    } catch (e) {
      console.error('[TeamVoice] Failed to start screen share', e);
      setIsScreenSharing(false);
    }
  };
  
  // Create a peer connection for screen sharing to a specific user (called when viewer subscribes)
  const createScreenPcForViewer = async (viewerId: string) => {
    const currentWs = wsRef.current;
    console.log('[TeamVoice] createScreenPcForViewer called for:', viewerId, 'ws:', !!currentWs, 'stream:', !!localScreenStreamRef.current);
    
    if (!currentWs || !localScreenStreamRef.current) {
      console.warn('[TeamVoice] Cannot create PC - ws or stream missing');
      return;
    }
    
    const stream = localScreenStreamRef.current;
    
    try {
      // Check if we already have a PC for this viewer
      if (screenPcsRef.current[viewerId]) {
        console.log('[TeamVoice] Already have PC for viewer', viewerId);
        return;
      }
      
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      screenPcsRef.current[viewerId] = pc;
      
      // Add screen tracks to the connection
      stream.getTracks().forEach(track => {
        console.log('[TeamVoice] Adding track to PC:', track.kind);
        pc.addTrack(track, stream);
      });
      
      pc.onicecandidate = (ev) => {
        if (ev.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({ type: 'ice-candidate', candidate: ev.candidate, to: viewerId }));
        }
      };
      
      pc.onconnectionstatechange = () => {
        console.log('[TeamVoice] Presenter PC connection state for', viewerId, ':', pc.connectionState);
      };
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const offerMessage = { type: 'offer', sdp: pc.localDescription, to: viewerId };
      console.log('[TeamVoice] Presenter sending offer message:', JSON.stringify(offerMessage).substring(0, 200));
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify(offerMessage));
        console.log('[TeamVoice] Presenter sent offer to viewer', viewerId);
      } else {
        console.error('[TeamVoice] Cannot send offer - WebSocket not available');
      }
      
    } catch (e) {
      console.error('[TeamVoice] Failed to create screen PC for viewer', viewerId, e);
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach(track => track.stop());
      localScreenStreamRef.current = null;
    }
    
    // Close all screen share peer connections
    Object.values(screenPcsRef.current).forEach(pc => {
      try { pc.close(); } catch {}
    });
    screenPcsRef.current = {};
    
    setIsScreenSharing(false);
    setScreenStream(undefined);
    
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    
    // Notify server we're stopping screen share
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'screenshare-stop' }));
    }
  };

  // Handle new users joining while we're screen sharing - they will subscribe via WebSocket
  // No need to proactively create PCs, wait for screenshare-subscribe messages

  const displayName = (id: string) => {
    const found = users.find((u) => String(u.userId) === String(id));
    if (found && (found as any).username) return (found as any).username;
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
          <p className="text-lg font-semibold">Not joined to room</p>
          <Button size="lg" onClick={() => doJoin()} disabled={!selectedRoomId || !user?.id || isJoining}>{isJoining ? 'Joining…' : 'Join Room'}</Button>
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
                      {String(u.userId) === presenterId && (
                        <div className="text-xs text-muted-foreground">Presenting</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Normal layout without screen share */
            <div className="grid gap-4 w-full flex-1 items-stretch overflow-auto" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: '1fr' }}>
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
          )}
        </div>
      )}
    </div>
  );
}
