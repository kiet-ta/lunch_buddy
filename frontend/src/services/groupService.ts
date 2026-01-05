import client from "../api/client";

export interface Group {
    id: number;
    name: string;
    description?: string;
}

export interface InviteResponse {
    invite_url: string;
    qr_code_data: string;
    expires_at: string;
}

export const groupService = {
    getMyGroups: async () => {
        const response = await client.get<Group[]>("/groups/");
        return response.data;
    },

    createGroup: async (name: string, description: string) => {
        const response = await client.post<Group>("/groups/", {
            name,
            description,
        });
        return response.data;
    },

    getInviteLink: async (groupId: number) => {
        const response = await client.post<InviteResponse>(
            `/groups/${groupId}/invite`,
        );
        return response.data;
    },

    joinByToken: async (token: string) => {
        const response = await client.post("/groups/join-by-token", { token });
        return response.data;
    },
};
