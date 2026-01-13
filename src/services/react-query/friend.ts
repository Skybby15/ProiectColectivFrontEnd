import { api as generatedApi } from "./api";
import { useMutation } from "@tanstack/react-query";
import type { DtoFriendRequestResponse, DtoUserResponse } from "@/api";

export type EnrichedPending = {
  request: DtoFriendRequestResponse;
  user?: DtoUserResponse;
};

// helper intern pentru pending + enrich
const fetchPendingRequestsForUser = async (
  userId: string
): Promise<EnrichedPending[]> => {
  const resp = await generatedApi.friendRequestsUserIdGet(userId);
  // generatedApi may return either: { data: [...] } or directly an array, or an empty object.
  // Normalize to `data` so downstream checks work and avoid noisy warnings when the
  // backend returns an unexpected empty object.
  const raw = resp ?? {};
  const data = (raw as any).data !== undefined ? (raw as any).data : raw;

  let requests: DtoFriendRequestResponse[] = [];

  if (Array.isArray(data)) {
    // cazul în care backend-ul întoarce direct un array
    requests = data as DtoFriendRequestResponse[];
  } else if (data && Array.isArray((data as any).requests)) {
    // cazul vechi: { requests: [...] }
    requests = (data as any).requests;
  } else if (data && Array.isArray((data as any).pendingRequests)) {
    // dacă backend-ul a fost schimbat să trimită { pendingRequests: [...] }
    requests = (data as any).pendingRequests;
  } else {
    // Don't spam the console with the full object; give a concise hint and return empty.
    console.warn("Unexpected pending response shape; returning empty list.", Array.isArray(data) ? 'array' : typeof data);
    requests = [];
  }

  const enriched = await Promise.all(
    requests.map(async (r) => {
      try {
        const uResp = await generatedApi.usersIdGet(r.fromUserId || "");
        const user = (uResp && (uResp as any).data) as DtoUserResponse;
        return { request: r, user } as EnrichedPending;
      } catch (e) {
        return { request: r } as EnrichedPending;
      }
    })
  );

  return enriched;
};


// GET pending requests
export const useGetPendingRequests = () => {
  return useMutation<EnrichedPending[], Error, { userId: string }>({
    mutationFn: ({ userId }) => fetchPendingRequestsForUser(userId),
    onError: (err) => {
      console.error("Error fetching pending friend requests:", err);
    },
  });
};

// POST /friend-requests/:fromUserId/:toUserId
export const useSendFriendRequest = () => {
  return useMutation<DtoFriendRequestResponse, Error, { fromUserId: string; toUserId: string }>({
    mutationFn: ({ fromUserId, toUserId }) =>
      generatedApi
        .friendRequestsFromUserIdToUserIdPost(fromUserId, toUserId)
        .then((res: any) => res.data),
    onError: (err) => {
      console.error("Error sending friend request:", err);
    },
  });
};

// PUT /friend-requests/:fromUserId/:toUserId (accept / reject)
export const useRespondFriendRequest = () => {
  return useMutation<
    DtoFriendRequestResponse,
    Error,
    { fromUserId: string; toUserId: string; accept: boolean }
  >({
    mutationFn: ({ fromUserId, toUserId, accept }) =>
      generatedApi
        .friendRequestsFromUserIdToUserIdPut(fromUserId, toUserId, { accept })
        .then((res: any) => res.data),
    onError: (err) => {
      console.error("Error responding to friend request:", err);
    },
  });
};

// "search users" – ia toți userii și filtrează pe client
export const useSearchUsers = () => {
  return useMutation<DtoUserResponse[], Error, { query: string }>({
    mutationFn: async ({ query }) => {
      const resp = await generatedApi.usersGet();
      const users = ((resp && (resp as any).data) || []) as DtoUserResponse[];

      const q = (query || "").toLowerCase().trim();
      if (!q) return [];

      return users.filter((u) => {
        return !!(
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          ((u.firstname || "").toLowerCase().includes(q)) ||
          ((u.lastname || "").toLowerCase().includes(q))
        );
      });
    },
    onError: (err) => {
      console.error("Error searching users:", err);
    },
  });
};
