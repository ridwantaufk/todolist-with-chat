import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    const { userId, role } = payload as { userId: string; role: string };

    return { userId, role };
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// GET: Ambil semua task
export async function GET(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1]; // Extract token from Authorization header
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);
  console.log("user info : ", user);
  if (!user || user.role !== "Lead") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const tasks = await prisma.task.findMany();
  console.log("Fetched Tasks:", tasks);
  return NextResponse.json(tasks);
}

// POST: Buat task baru (hanya Lead)
export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1]; // Extract token from Authorization header
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);

  const leadId = user.userId;

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
        leadId,
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
  const token = req.headers.get("Authorization")?.split(" ")[1];
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
