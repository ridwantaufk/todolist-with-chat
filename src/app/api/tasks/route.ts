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

  const tasks = await prisma.task.findMany({
    where: {
      leadId: user.userId,
    },
    include: {
      lead: true, // menyertakan informasi Lead
      team: true, // menyertakan informasi Team
    },
  });

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

  const { title, status, description, leadId, teamId } = await req.json();

  try {
    const existingTasks = await prisma.task.count();
    const taskCode = `TASK-${existingTasks + 1}`;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        leadId,
        teamId,
        taskCode: taskCode,
      },
    });

    // mencatat log pas tugas baru dibuat
    const userName = await prisma.user
      .findUnique({
        where: { id: user.userId },
        select: { name: true },
      })
      .then((user) => user?.name || "Unknown User");

    await prisma.taskLog.create({
      data: {
        taskId: newTask.id,
        action: "Task Created",
        description,
        message: `Task created with title: ${title} by ${userName}`,
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

  const { id, title, status, description, leadId, teamId } = await req.json();

  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(description && { description }),
        ...(leadId && { leadId }),
        ...(teamId && { teamId }),
        updatedAt: new Date(),
      },
    });

    const userName = await prisma.user
      .findUnique({
        where: { id: user.userId },
        select: { name: true },
      })
      .then((user) => user?.name || "Unknown User");

    function getStatusText(status) {
      switch (status) {
        case "NOT_STARTED":
          return "Not Started";
        case "ON_PROGRESS":
          return "On Progress";
        case "DONE":
          return "Completed";
        case "REJECT":
          return "Rejected";
        default:
          return "Unknown Status";
      }
    }

    // Contoh penggunaan dalam taskLog
    await prisma.taskLog.create({
      data: {
        taskId: id,
        action: description
          ? "Description Updated"
          : status === "NOT_STARTED"
          ? `Task Created (Status: ${getStatusText(status)})`
          : status === "ON_PROGRESS"
          ? `Task Progressed (Status: ${getStatusText(status)})`
          : status === "DONE"
          ? `Task Completed (Status: ${getStatusText(status)})`
          : status === "REJECT"
          ? `Task Rejected (Status: ${getStatusText(status)})`
          : "Task Updated",

        description,

        message: description
          ? `Task description updated with new details: ${description} by ${userName}`
          : status === "NOT_STARTED"
          ? `Task created with status: ${getStatusText(status)} by ${userName}`
          : status === "ON_PROGRESS"
          ? `Task is now on progress with status: ${getStatusText(
              status
            )} by ${userName}`
          : status === "DONE"
          ? `Task completed with status: ${getStatusText(
              status
            )} by ${userName}`
          : status === "REJECT"
          ? `Task rejected with status: ${getStatusText(status)} by ${userName}`
          : `Task status updated to: ${getStatusText(status)} by ${userName}`,
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
