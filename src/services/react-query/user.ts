import { useMutation } from "@tanstack/react-query";
import type {
  DtoStatisticsResponse,
  DtoUserPasswordRequestDTO,
  DtoUserUpdateRequestDTO,
  DtoUserUpdateResponseDTO,
} from "@/api";
import { api } from "./api"
import { useAuthStore } from "../stores/useAuthStore";
import { useStatisticsStore } from "../stores/useStatisticsStore";

// When database has stat data for everyone this will be removed
const MOCK_TIME_ON_TEAM = [
  {
    duration: 120000,
    teamId: "team-1"
  },
  {
    duration: 450000,
    teamId: "team-2"
  },
  {
    duration: 300000,
    teamId: "team-3"
  }
]

// When database has stat data for everyone this will be removed
const MOCK_TOTAL_TIME = 2400000; // 40 minutes in milliseconds

export const useUpdateUserData = () => {
  return useMutation<DtoUserUpdateResponseDTO, Error, { id: string, user: DtoUserUpdateRequestDTO }>({
    mutationFn: ({ id, user }) =>
      api.usersIdPatch(id, user).then(res => res.data),
    onSuccess: (data) => {
      const auth = useAuthStore.getState();
      if (data) {
        const { email, firstname, id, lastname, statistics, teams, topicsOfInterest, username } = data;
        auth.setUser({ email, firstname, id, lastname, statistics, teams, topicsOfInterest, username });
      }
    }
  });
};

export const useUpdateUserPassword = () => {
  return useMutation<string | { [key: string]: string; }, Error, { id: string, request: DtoUserPasswordRequestDTO }>({
    mutationFn: ({ id, request }) =>
      api.usersIdPasswordPut(id, request).then(res => res.data),
  });
}

export const useGetUserStatistics = () => {
  return useMutation<DtoStatisticsResponse, Error, { id: string }>({
    mutationFn: ({ id }) =>
      api.usersIdStatisticsGet(id).then(res => res.data),
    onSuccess: (data) => {
      const stats = useStatisticsStore.getState();

      if(data) {
        // When database has stat data for everyone this will be removed
        if (!data.timeSpentOnTeams)
          data.timeSpentOnTeams = MOCK_TIME_ON_TEAM;
        stats.setStats(data);
      }
    },
    onError: () => {
      // When database has stat data for everyone this will be removed
      const stats = useStatisticsStore.getState();
      const mock_data : DtoStatisticsResponse = {
        timeSpentOnTeams: MOCK_TIME_ON_TEAM,
        totalTimeSpentOnApp: MOCK_TOTAL_TIME,
        userId: "mock-user-id"
      };
      stats.setStats(mock_data);
    }
  });
}