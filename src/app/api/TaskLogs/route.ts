import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();

// Verifikasi token JWT
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

// Ambil token dari cookie
function getTokenFromCookie(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const tokenCookie = cookieHeader
    .split("; ")
    .find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

// GET: Ambil semua task logs
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

  const taskLogs = await prisma.taskLog.findMany({
    orderBy: {
      timestamp: "desc",
    },
    include: {
      task: {
        select: {
          taskCode: true,
          lead: { select: { name: true } },
          team: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(taskLogs);
}

// POST: Buat task log baru
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
      { error: "Unauthorized: Only Leads can create task logs" },
      { status: 403 }
    );
  }

  const { taskId, action, description, message } = await req.json();

  try {
    const newTaskLog = await prisma.taskLog.create({
      data: {
        taskId,
        action,
        description,
        message,
      },
    });
    return NextResponse.json(newTaskLog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task log" },
      { status: 500 }
    );
  }
}

// PUT: Memperbarui task dan mencatat task log
export async function PUT(req: NextRequest) {
  const token = getTokenFromCookie(req);

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: User not found or not authenticated." },
      { status: 403 }
    );
  }

  const { id, status, description } = await req.json();

  try {
    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(description && { description }),
        updatedAt: new Date(),
      },
    });

    // Catat perubahan di task logs
    await prisma.taskLog.create({
      data: {
        taskId: id,
        action: description ? "Description Updated" : "Status Updated",
        description,
        message: description
          ? "Task description updated"
          : `Task status updated to ${status}`,
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
