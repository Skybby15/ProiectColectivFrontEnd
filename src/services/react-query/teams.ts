import {useMutation, useQuery} from "@tanstack/react-query";
import type {ControllerMessageRequestUnion, DtoAddUserToTeamResponse, DtoFileListResponse, DtoFileUploadRequest, DtoFileUploadResponse, DtoMessageDTO, DtoTeamMessageRequest, DtoTeamRequest, EntityFile, EntityTeam} from "@/api";
import { api } from './api'
import {useTeamStore} from "@/services/stores/useTeamStore.ts";
import { useAuthStore } from "../stores/useAuthStore";



export const useGetTeams = () => {
    return useMutation<EntityTeam[], Error>({
        mutationFn: () => api.teamsGet().then(res=>res.data),
        onSuccess: (data: EntityTeam[]) => {
            if (!data) return;
            const team = useTeamStore.getState();
            if(data) team.setTeams(data as EntityTeam[]);
        },
        onError: (err) => {
            console.error("Error fetching teams:", err);
        },

    })
}

export const useAddTeam = () => {
    return useMutation<EntityTeam, Error, DtoTeamRequest>({
        mutationFn: (data) => api.teamsPost(data).then(res=>res.data),
        onSuccess: (data) => {
            if (!data) return;
            const team = useTeamStore.getState();
            if(data) team.addTeam(data as EntityTeam);
        }
    })
}

export const useJoinTeam = () => {
    return useMutation<DtoAddUserToTeamResponse, Error, { teamId: string; userId: string }>(
        {
            mutationFn: ({ teamId, userId }) =>
                api.teamsUsersPut({
                    teamId,
                    userId
                }).then(res => res.data),

            onSuccess: (updatedTeam) => {
                const store = useTeamStore.getState();
                store.updateTeam(updatedTeam.team!);
            },

            onError: (err) => {
                console.error("Error joining team:", err);
            }
        }
    );
};

export const useOpenTeam = () => {
    return useMutation<undefined | EntityTeam, Error, {teamId: string}>({
        mutationFn: async ({ teamId }) => {
            const store = useTeamStore.getState();
            try{
                store.setOpenTeam(teamId)
                return undefined
            } catch {
                const res = await api.teamsIdGet(teamId).then(r => r.data).catch(() => null)
                if (!res) throw new Error(`Team with id ${teamId} not found`)
                return res as EntityTeam
            }
        },

        onSuccess: (optionalTeam) => {
            const store = useTeamStore.getState()
            if (!optionalTeam) return
            // Add fetched team to store and open it
            try {
                store.addTeam(optionalTeam)
                const id = optionalTeam.id
                if (id) store.setOpenTeam(id)
            } catch (e) {
                console.error("Failed to add/open fetched team:", e)
            }
        }
    })
}


export const useGetTeamMessages = () => {
    const teamStore = useTeamStore();

    return useMutation<DtoMessageDTO[],Error, {teamId : string}>({
        mutationFn: ({teamId}) =>
            api.messagesGet(
            "team",
            undefined,
            undefined,
            teamId
        ).then(res => res.data),

        onSuccess: (dto) => {
            teamStore.setTeamMessages(dto.sort((a, b) => Date.parse(a.sentAt!) - Date.parse(b.sentAt!)))
        }
    })
}

export const useSendTeamMessage = () => {
    const teamStore = useTeamStore();
    const {user} = useAuthStore();

    return useMutation<DtoMessageDTO,Error,DtoTeamMessageRequest>({
        mutationFn: (teamMessageRequest) => api.messagesPost(
            "team",
            teamMessageRequest as ControllerMessageRequestUnion
        ).then(res => res.data),

        onMutate: (dto) => {
            teamStore.addSentMessage(
                {
                    sender:{
                        ...user
                    },
                    sentAt: new Date().toISOString(),
                    textContent: dto.textContent
                }
            )
        }
    })
}

export const useAddTeamFile = () => {
    const teamStore = useTeamStore();

    return useMutation<DtoFileUploadResponse, Error, { teamId : string, request: DtoFileUploadRequest}>({
        mutationFn: ({ teamId, request }) => 
            api.teamsIdFilesPost(
                teamId,
                request
            ).then(res => res.data),

        onSuccess: (data) => {
            teamStore.addTeamFile(data);
        },

        onError: (err) => {
            console.error("Error uploading file:", err);
        }
    })
}


export const useGetTeamFiles = () => {
    const teamStore = useTeamStore();

    return useMutation<DtoFileListResponse, Error, {teamId: string, page: number, limit: number}>({
        mutationFn: ({teamId,page,limit}) =>
        api.teamsIdFilesGet(
            teamId, 
            page, 
            limit
        ).then(res => res.data),

        onSuccess: (data) => {
            console.log("Success")
        teamStore.addTeamFilesMeta(data.files || []);
        },

        onError: (err) => {
        console.error("Error fetching team files:", err);
        }
    }) 
};

export const useGetFile = () => {
  return useMutation<EntityFile, Error, { teamId: string; fileId: string }>({
    mutationFn: ({ teamId, fileId }) =>
      api.teamsIdFilesFileIdGet(teamId, fileId).then(res => res.data),

    onSuccess: (file) => {
      if (!file.content || !file.name) return;

      // 1️⃣ Decode Base64 content to bytes
      const binaryString = atob(file.content); // Base64 -> binary string
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2️⃣ Create Blob from bytes
      const blob = new Blob([bytes], { type: file.type || "application/octet-stream" });

      // 3️⃣ Create temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();

      // 4️⃣ Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });
};


