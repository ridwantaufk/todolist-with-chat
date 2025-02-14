// import bcrypt from "bcryptjs";
// import { SignJWT, jwtVerify } from "jose"; // Import from 'jose'

// const SECRET_KEY = process.env.JWT_SECRET;

// export const hashPassword = async (password: string): Promise<string> => {
//   const salt = await bcrypt.genSalt(10);
//   return bcrypt.hash(password, salt);
// };

// export const comparePassword = async (
//   password: string,
//   hashed: string
// ): Promise<boolean> => {
//   return bcrypt.compare(password, hashed);
// };

// // Use SignJWT from 'jose' to generate the token
// export const generateToken = async (
//   userId: string,
//   role: string
// ): Promise<string> => {
//   const secret = new TextEncoder().encode(SECRET_KEY);
//   const token = await new SignJWT({ userId, role })
//     .setExpirationTime("1d")
//     .sign(secret);
//   return token;
// };

// // Use jwtVerify from 'jose' to verify the token
// export const verifyToken = async (token: string) => {
//   try {
//     const secret = new TextEncoder().encode(SECRET_KEY);
//     const { payload } = await jwtVerify(token, secret);
//     return payload; // Return the decoded payload (userId, role, etc.)
//   } catch (error) {
//     throw new Error("Invalid token");
//   }
// };

import { jwtVerify } from "jose";

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
