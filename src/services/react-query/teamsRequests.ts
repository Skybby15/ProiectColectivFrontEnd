import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import { useTeamStore } from "@/services/stores/useTeamStore";
import type {
    DtoTeamRequestCreateDTO,
    DtoTeamRequestItemDTO,
    DtoTeamRequestsResponseDTO,
    DtoAddUserToTeamResponse,
} from "@/api";

export const useCreateTeamRequest = () => {
    return useMutation<DtoTeamRequestItemDTO, Error, DtoTeamRequestCreateDTO>({
        mutationFn: (body) => api.teamRequestsPost(body).then((res) => res.data),

        onSuccess: (created) => {
            const store = useTeamStore.getState();
            store.addTeamRequest(created);
        },

        onError: (err) => {
            console.error("Error creating team request:", err);
        },
    });
};

export const useGetAllTeamRequests = () => {
    return useMutation<DtoTeamRequestsResponseDTO, Error>({
        mutationFn: () => api.teamRequestsGet().then((res) => res.data),

        onSuccess: (data) => {
            const store = useTeamStore.getState();
            store.setTeamRequests(data?.requests ?? []);
        },

        onError: (err) => {
            console.error("Error fetching team requests:", err);
        },
    });
};

export const useAcceptTeamRequest = () => {
    return useMutation<DtoAddUserToTeamResponse, Error, { id: string }>({
        mutationFn: ({ id }) => api.teamRequestsIdAcceptPut(id).then((res) => res.data),

        onSuccess: (data, vars) => {
            const store = useTeamStore.getState();

            if (data?.team) {
                store.updateTeam(data.team);
            }

            store.removeTeamRequest(vars.id);
        },

        onError: (err) => {
            console.error("Error accepting team request:", err);
        },
    });
};

export const useRejectTeamRequest = () => {
    return useMutation<{ [key: string]: string }, Error, { id: string }>({
        mutationFn: ({ id }) => api.teamRequestsIdRejectDelete(id).then((res) => res.data),

        onSuccess: (_data, vars) => {
            const store = useTeamStore.getState();
            store.removeTeamRequest(vars.id);
        },

        onError: (err) => {
            console.error("Error rejecting team request:", err);
        },
    });
};
