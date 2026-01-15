import { useMutation } from "@tanstack/react-query";
import type { DtoUpdateEventStatusRequest, DtoCreateEventRequest, DtoEventDTO } from "@/api";
import { api } from "./api";

export const useCreateEvent = () => {
    return useMutation<DtoEventDTO, Error, DtoCreateEventRequest>({
        mutationFn: (data) => api.eventsPost(data).then(res => res.data),
        onError: (err) => {
            console.log("Error creating event:", err);
        },
    })
}

export const useGetEvents = (teamId: string) => {
    return useMutation<DtoEventDTO[], Error>({
        mutationFn: async () => {
            if (!teamId) return [];
            const response = await api.eventsGet(teamId);
            const events = response.data ?? [];
            return events as DtoEventDTO[];
        },
        onError: (err) => {
            console.log("Error fetching events:", err);
        },
    })
}

export const useUpdateEventStatus = () => {
    return useMutation<DtoEventDTO, Error, { id: string, request: DtoUpdateEventStatusRequest }>({
        mutationFn: ({ id, request }) => api.eventsIdStatusPatch(id, request).then(res => res.data),
        onError: (err) => {
            console.log("Error updating status for event:", err);
        },
    })
}