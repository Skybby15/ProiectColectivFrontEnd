import type { DtoMessageDTO } from "@/api";
import { useEffect } from "react";
import { useTeamStore } from "../stores/useTeamStore";
import { useAuthStore } from "../stores/useAuthStore";

const WSPATH = import.meta.env.VITE_WSPATH;

export function useMessageSocket(token : string, onTeam : boolean) {
  const { user } = useAuthStore()
  const { openTeam ,addSentMessage } = useTeamStore()

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://${WSPATH}/messages/connect?token=${token}`,);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const messageDto = data.payload as DtoMessageDTO;

      if(onTeam)
      {

        if(messageDto.teamId != openTeam?.id)
          return

        if(messageDto.sender?.id == user?.id)
          return

        addSentMessage(messageDto)
      }

    };

  	console.log("Connected succesfully")
  
    return () => {
		if (ws && ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
			ws.close();
		}
	}}, []);
}