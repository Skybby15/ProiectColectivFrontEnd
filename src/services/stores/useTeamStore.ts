import type {DtoMessageDTO, EntityTeam} from '@/api/api';
import { create } from 'zustand';
import type { DtoTeamRequestItemDTO } from "@/api";

interface TeamState {
    teams: EntityTeam[];
    openTeam: EntityTeam | undefined;
    teamMessages: DtoMessageDTO[];

    setTeams: (teams: EntityTeam[]) => void;
    addTeam: (team: EntityTeam) => void;
    updateTeam: (team: EntityTeam) => void;

    setOpenTeam: (teamId : string) => void;
    clearOpenTeam: () => void;
    setTeamMessages: (messages: DtoMessageDTO[]) => void;
    addSentMessage: (message: DtoMessageDTO) => void;

    teamRequests: DtoTeamRequestItemDTO[];
    setTeamRequests: (reqs: DtoTeamRequestItemDTO[]) => void;
    removeTeamRequest: (id: string) => void;
    addTeamRequest: (req: DtoTeamRequestItemDTO) => void;

    requestedTeamIds: string[];
    addRequestedTeamId: (teamId: string) => void;


}

export const useTeamStore = create<TeamState>((set,get) => {

    return {
        teams: [],
        openTeam: undefined,
        teamMessages: [],
        teamRequests: [],

        requestedTeamIds: [],

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
                openTeam: undefined
            })
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


        addRequestedTeamId: (teamId) => {
            const current = get().requestedTeamIds;
            if (current.includes(teamId)) return;
            set({ requestedTeamIds: [...current, teamId] });
        },


    }});
