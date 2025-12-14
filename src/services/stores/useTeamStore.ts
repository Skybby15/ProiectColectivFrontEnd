import type {DtoFileUploadResponse, DtoMessageDTO, EntityTeam} from '@/api/api';
import { create } from 'zustand';

interface TeamState {
    teams: EntityTeam[];
    openTeam: EntityTeam | undefined;
    teamMessages: DtoMessageDTO[];
    teamFiles: DtoFileUploadResponse[];


    setTeams: (teams: EntityTeam[]) => void;
    addTeam: (team: EntityTeam) => void;
    updateTeam: (team: EntityTeam) => void;

    setOpenTeam: (teamId : string) => void;
    clearOpenTeam: () => void;
    setTeamMessages: (messages: DtoMessageDTO[]) => void;
    addSentMessage: (message: DtoMessageDTO) => void;

    addTeamFilesMeta: (files: DtoFileUploadResponse[]) => void;
    addTeamFile: (file: DtoFileUploadResponse) => void;
    removeTeamFile: (fileId: string) => void;

}

export const useTeamStore = create<TeamState>((set,get) => {

    return {
        teams: [],
        openTeam: undefined,
        teamMessages: [],
        teamFiles: [],

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

        addTeamFilesMeta: (files) => {
            const currentFiles = get().teamFiles;
            set({
                teamFiles: [...currentFiles, ...files]
            })
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
