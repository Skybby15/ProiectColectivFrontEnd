import type {DtoFileUploadResponse, DtoMessageDTO, DtoUserResponse, EntityTeam} from '@/api/api';
import { create } from 'zustand';
import type { DtoTeamRequestItemDTO } from "@/api";

interface TeamState {
    teams: EntityTeam[];
    openTeam: EntityTeam | undefined;
    teamMessages: DtoMessageDTO[];
    teamFiles: DtoFileUploadResponse[];
    teamMembers: DtoUserResponse[];
    getTeamMemberWithId: (id: string) => DtoUserResponse | undefined;


    setTeams: (teams: EntityTeam[]) => void;
    addTeam: (team: EntityTeam) => void;
    updateTeam: (team: EntityTeam) => void;

    setOpenTeam: (teamId : string) => void;
    clearOpenTeam: () => void;

    setTeamMembers: (members: DtoUserResponse[]) => void;

    setTeamMessages: (messages: DtoMessageDTO[]) => void;
    addSentMessage: (message: DtoMessageDTO) => void;

    teamRequests: DtoTeamRequestItemDTO[];
    setTeamRequests: (reqs: DtoTeamRequestItemDTO[]) => void;
    removeTeamRequest: (id: string) => void;
    addTeamRequest: (req: DtoTeamRequestItemDTO) => void;
    addTeamFilesMeta: (files: DtoFileUploadResponse[]) => void;
    addTeamFile: (file: DtoFileUploadResponse) => void;
    removeTeamFile: (fileId: string) => void;

}

export const useTeamStore = create<TeamState>((set,get) => {

    return {
        teams: [],
        openTeam: undefined,
        teamMessages: [],
        teamRequests: [],
        teamFiles: [],
        teamMembers: [],
        getTeamMemberWithId: (id: string) => {
            const members = get().teamMembers;
            return members.find((member) => member.id === id);
        },

        setTeams: (t) => {
            set({ teams: t });
        },

        addTeam: (team) => {
            const currentTeams = get().teams;
            set({ teams: [...currentTeams, team] });
        },
        updateTeam: (updatedTeam) => {
            const teams = get().teams;
            set({
                teams: teams.map(t =>
                    t.id === updatedTeam.id ? updatedTeam : t
                )
            });
        },

        setOpenTeam: (openedTeamId) => {

            const teams = get().teams;
            set({
                openTeam: teams.find((team) => team.id == openedTeamId )
            });

            const openedTeam = get().openTeam;
            if (openedTeam == undefined)
                throw Error("No team with given id found")
        },

        clearOpenTeam: () => {
            set({
                openTeam: undefined,
                teamMessages: [],
                teamFiles: [],
                teamMembers: []
            })
        },

        setTeamMembers: (members) => {
            set({ teamMembers: members });
        },

        setTeamMessages: (messages) => {
            set({
                teamMessages: messages
            })
        },

        addSentMessage: (message) => {
            set(state => ({
                teamMessages: [...state.teamMessages, message]
            }))
        },

        setTeamRequests: (reqs) => set({ teamRequests: reqs }),

        removeTeamRequest: (id) =>
            set({ teamRequests: get().teamRequests.filter(r => r.id !== id) }),

        addTeamRequest: (req) =>
            set({ teamRequests: [...get().teamRequests, req] }),
        addTeamFilesMeta: (files) => {
            set(state => {
                const map = new Map(state.teamFiles.map(f => [f.id, f]));
                files.forEach(f => map.set(f.id, f));
                return { teamFiles: Array.from(map.values()) };
            });
        },

        addTeamFile: (file) => {
            set(state => ({
                teamFiles: [...state.teamFiles, file]
            }))
        },

        removeTeamFile: (fileId) => {
            const currentFiles = get().teamFiles;
            set({
                teamFiles: currentFiles.filter(f => f.id !== fileId)
            })
        }

    }});
