import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const BASE_PATH = import.meta.env.VITE_BASEPATH;

const axiosInstance = axios.create({ baseURL: BASE_PATH });

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RoomResponse {
  id: string;
  teamId: string;
  name: string;
  type: string; // group | private
  createdBy: string;
  createdAt: number;
  userCount: number;
}

export async function getActiveRooms(teamId: string): Promise<RoomResponse[]> {
  const { data } = await axiosInstance.get<RoomResponse[]>(`/voice/rooms/${teamId}`);
  return data;
}

export async function getJoinableRooms(userId: string): Promise<RoomResponse[]> {
  const { data } = await axiosInstance.get<RoomResponse[]>(`/voice/joinable`, {
    params: { userId },
  });
  return data;
}

export async function createVoiceRoom(teamId: string, userId: string, name?: string) {
  const { data } = await axiosInstance.post(`/voice/rooms/${teamId}`, null, {
    params: { userId, name },
  });
  return data as RoomResponse;
}

export function buildJoinWsUrl(roomId: string, userId: string) {
  const host = import.meta.env.VITE_WSPATH;
  return `wss://${host}/voice/join/${roomId}?userId=${encodeURIComponent(userId)}`;
}
