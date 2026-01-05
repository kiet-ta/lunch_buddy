import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import QRCode from "react-native-qrcode-svg";
import client from "../api/client";

interface GroupInviteQRProps {
    groupId: number;
}

export const GroupInviteQR = ({ groupId }: GroupInviteQRProps) => {
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch invite link from backend
        const fetchInvite = async () => {
            try {
                const response = await client.post(`/groups/${groupId}/invite`);
                setInviteLink(response.data.invite_url);
            } catch (error) {
                console.error("Failed to get invite link", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [groupId]);

    if (loading) return <ActivityIndicator />;
    if (!inviteLink) return <Text>Could not load QR code</Text>;

    return (
        <View style={{ alignItems: "center", padding: 20 }}>
            {/* Generate QR Code from the deep link */}
            <QRCode value={inviteLink} size={200} />
            <Text style={{ marginTop: 10, color: "#666" }}>Scan to join group</Text>
        </View>
    );
};
