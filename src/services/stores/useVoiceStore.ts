import { create } from "zustand";
import type { RoomResponse } from "../react-query/voice";

type VoiceUser = { userId: string; username?: string };

type VoiceState = {
  rooms: RoomResponse[];
  selectedRoomId?: string;
  users: VoiceUser[];
  ws?: WebSocket;
  speaking: Record<string, boolean>;
  // Screenshare state
  presenterId?: string;
  screenStream?: MediaStream;
  // Mute state
  isMuted: boolean;
  setRooms: (rooms: RoomResponse[]) => void;
  selectRoom: (roomId?: string) => void;
  setUsers: (users: VoiceUser[]) => void;
  addUser: (user: string | VoiceUser) => void;
  removeUser: (userId: string) => void;
  setWs: (ws?: WebSocket) => void;
  setSpeaking: (userId: string, val: boolean) => void;
  setPresenterId: (id?: string) => void;
  setScreenStream: (stream?: MediaStream) => void;
  setIsMuted: (v: boolean) => void;
  reset: () => void;
};

export const useVoiceStore = create<VoiceState>((set, get) => ({
  rooms: [],
  selectedRoomId: undefined,
  users: [],
  ws: undefined,
  speaking: {},
  presenterId: undefined,
  screenStream: undefined,
  isMuted: true,
  setRooms: (rooms) => set({ rooms }),
  setPresenterId: (id) => set({ presenterId: id }),
  setScreenStream: (stream) => set({ screenStream: stream }),
  setIsMuted: (v) => set({ isMuted: v }),
  selectRoom: (roomId) => set({ selectedRoomId: roomId, users: [] }),
  setUsers: (users) => set({ users }),
  addUser: (user) => set((s) => {
    const maybeObj: VoiceUser = typeof user === 'string' ? { userId: user } : user;
    const exists = s.users.some((u) => u.userId === maybeObj.userId);
    if (exists) {
      // If we received a username update for an existing user, update it
      if (maybeObj.username) {
        const updated = s.users.map((u) => (u.userId === maybeObj.userId ? { ...u, username: maybeObj.username } : u));
        return { users: updated };
      }
      return s;
    }
    return { users: [...s.users, maybeObj] };
  }),
  removeUser: (userId) => set((s) => ({ users: s.users.filter((u) => u.userId !== userId) })),
  setWs: (ws) => set({ ws }),
  setSpeaking: (userId, val) => set((s) => ({ speaking: { ...(s.speaking || {}), [userId]: val } })),
  reset: () => {
    try {
      const current = get();
      if (current.ws) {
        try { current.ws.close(); } catch {}
      }
      if (current.screenStream) {
        try { current.screenStream.getTracks().forEach(t => t.stop()); } catch {}
      }
    } catch {}
    set({ rooms: [], selectedRoomId: undefined, users: [], ws: undefined, speaking: {}, presenterId: undefined, screenStream: undefined, isMuted: true });
  },
}));
