import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Menggunakan jose untuk verifikasi JWT

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from the environment variables.");
}

export async function middleware(req: NextRequest) {
  const publicRoutes = ["/api/auth", "/auth/login", "/auth/register"];
  const url = req.nextUrl.pathname;

  if (publicRoutes.includes(url)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.error("No token found in cookies");
    return new Response(
      JSON.stringify({ error: "Unauthorized: No token provided" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const decoded = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    const decodedToken = decoded.payload as { userId: string; role: string };

    const res = NextResponse.next();
    res.headers.set("userId", decodedToken.userId);
    res.headers.set("role", decodedToken.role);

    return res;
  } catch (error) {
    console.error("Invalid token:", error.message);
    return new Response(
      JSON.stringify({
        error: "Unauthorized: Invalid token",
        details: error.message,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = {
  matcher: ["/api/tasks/:path*", "/dashboard/:path*"],
};
