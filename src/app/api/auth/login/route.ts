import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from the environment variables.");
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  // Generate token
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const response = NextResponse.json({ message: "Login successful" });

  // Set cookie HTTP-only untuk token
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1 jam
    path: "/",
  });

  return response;
}
