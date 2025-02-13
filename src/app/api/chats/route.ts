import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import { jwtVerify } from "jose";

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

pgClient.connect();
pgClient.query("LISTEN new_message");

const prisma = new PrismaClient();

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

function getTokenFromCookie(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const tokenCookie = cookieHeader
    .split("; ")
    .find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

// ambil semua pesan antara user dan receiver tertentu
export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user || !user.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId");
  //   console.log("receiverId : ", receiverId);
  if (!receiverId) {
    return NextResponse.json(
      { error: "receiverId is required" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    start(controller) {
      const sendMessages = async () => {
        try {
          const messages = await prisma.chat.findMany({
            where: {
              OR: [
                { AND: [{ senderId: user.userId }, { receiverId }] },
                {
                  AND: [{ senderId: receiverId }, { receiverId: user.userId }],
                },
              ],
            },
            orderBy: { createdAt: "asc" },
          });

          console.log("🔔 Sending messages:", messages);
          controller.enqueue(`data: ${JSON.stringify(messages)}\n\n`);
        } catch (error) {
          console.error("❌ Error fetching messages:", error);
          controller.enqueue(
            `data: ${JSON.stringify({ error: "Error fetching messages" })}\n\n`
          );
        }
      };

      sendMessages(); // fetch pertama x

      const onNewMessage = (msg) => {
        console.log("New message received : ", msg.payload);
        sendMessages();
      };

      pgClient.on("notification", onNewMessage);

      req.signal.addEventListener("abort", () => {
        pgClient.off("notification", onNewMessage);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// naro pesan baru ke database
export async function POST(req: NextRequest) {
  const token = getTokenFromCookie(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { text, receiverId, senderId } = await req.json();

  // console.log("req.json() : ", text, receiverId);
  //   return;
  if (!text.trim()) {
    return NextResponse.json(
      { error: "Message cannot be empty" },
      { status: 400 }
    );
  }
  if (!receiverId) {
    return NextResponse.json(
      { error: "receiverId is required" },
      { status: 400 }
    );
  }

  try {
    const newMessage = await prisma.chat.create({
      data: {
        text,
        senderId,
        receiverId,
      },
    });
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
