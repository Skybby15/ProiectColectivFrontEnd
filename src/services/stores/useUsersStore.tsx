import { create } from "zustand";
import type { EntityUser } from "@/api";
import { api } from "@/services/react-query/api";

type UsersState = {
    usersById: Record<string, EntityUser>;
    setUser: (u: EntityUser) => void;
    fetchUserById: (id: string) => Promise<EntityUser | null>;
};

export const useUsersStore = create<UsersState>((set, get) => ({
    usersById: {},

    setUser: (u) => {
        if (!u?.id) return;
        const id = u.id;
        set((state) => ({
            usersById: { ...state.usersById, [id]: u },
        }));
    },

    fetchUserById: async (id: string) => {
        if (!id) return null;

        const cached = get().usersById[id];
        if (cached) return cached;

        try {
            const user = await api.usersIdGet(id).then((r) => r.data);
            set((state) => ({
                usersById: { ...state.usersById, [id]: user },
            }));
            return user;
        } catch (e) {
            console.error("Failed to fetch user:", id, e);
            return null;
        }
    },
}));
