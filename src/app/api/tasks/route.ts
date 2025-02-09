import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const runtime = "nodejs";

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

// ambil token dari cookie
function getTokenFromCookie(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const tokenCookie = cookieHeader
    .split("; ")
    .find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

// GET: Ambil semua task
export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req);

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);
  if (!user || user.role !== "Lead") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const tasks = await prisma.task.findMany();
  return NextResponse.json(tasks);
}

// POST: Buat task baru (hanya Lead)
export async function POST(req: NextRequest) {
  const token = getTokenFromCookie(req);

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);

  if (!user || user.role !== "Lead") {
    return NextResponse.json(
      { error: "Unauthorized: Only Leads can create tasks" },
      { status: 403 }
    );
  }

  const { title, description, teamId } = await req.json();

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: "Not Started",
        leadId: user.userId,
        teamId,
      },
    });
    return NextResponse.json(newTask);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PUT: Update status task (hanya Team yang dapat mengubah statusnya)
export async function PUT(req: NextRequest) {
  const token = getTokenFromCookie(req);

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);

  if (!user || user.role !== "Team") {
    return NextResponse.json(
      { error: "Unauthorized: Only Teams can update task status" },
      { status: 403 }
    );
  }

  const { id, status, description } = await req.json();

  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    // Catat perubahan status di task_logs
    await prisma.taskLog.create({
      data: {
        taskId: id,
        action: "Status Updated",
        description,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
