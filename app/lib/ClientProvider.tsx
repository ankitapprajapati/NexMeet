"use client";
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  const videoClient = useInitializeVideoClient();
  if (!videoClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}

function useInitializeVideoClient() {
  const { data: session } = useSession();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!session) {
      setVideoClient(null);
      return;
    }

    const streamUser: User = {
      id: session.user.id,
      name: session.user.name!,
    };

    const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
    if (!apiKey) {
      throw new Error("Stream API Key not set");
    }

    const tokenProvider = async () => {
      const res = await fetch("/api/token");
      if (!res.ok) throw new Error("Failed to fetch Stream token");
      const data = await res.json();
      return data.token;
    };

    const client = new StreamVideoClient({
      apiKey,
      user: streamUser,
      tokenProvider,
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
      setVideoClient(null);
    };
  }, [session?.user.id, session?.user.name]);

  return videoClient;
}
