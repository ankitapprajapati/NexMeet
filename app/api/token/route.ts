import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { getServerSession } from "next-auth";
import { Next_Auth_Config } from "@/app/lib/auth";

export async function GET() {
  const streamApiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!;
  const apiSecret = process.env.VIDEOSDK_SECRET_KEY!;
  const session = await getServerSession(Next_Auth_Config);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const streamClient = new StreamClient(streamApiKey, apiSecret);
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  const token = streamClient.createToken(session.user.id, expiration, issuedAt);
  return NextResponse.json({ token });
}
