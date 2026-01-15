import type {DtoMessageDTO, EntityTeam} from '@/api/api';
import { create } from 'zustand';

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
}

export const useTeamStore = create<TeamState>((set,get) => {

    return {
        teams: [],
        openTeam: undefined,
        teamMessages: [],

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
        }

    }});
