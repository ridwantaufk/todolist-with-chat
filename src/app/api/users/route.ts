import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();

export async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    const { userId, role } = payload as { userId: string; role: string };
    return { userId, role };
  } catch (error) {
    throw new Error("Invalid token");
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

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req);
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Ambil hanya kolom 'name' dari semua pengguna
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const loggedInUser = users.find((u) => u.id === user.userId);
    // console.log("loggedInUser : ", loggedInUser);
    return NextResponse.json({
      users,
      loggedInUser: loggedInUser
        ? { id: loggedInUser.id, name: loggedInUser.name }
        : null,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json("Failed to fetch users", { status: 500 });
  }
}
