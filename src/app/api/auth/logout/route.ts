import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.json({ message: "Logged out successfully" });

  // Menghapus cookie token
  res.cookies.delete("token");

  return res;
}
