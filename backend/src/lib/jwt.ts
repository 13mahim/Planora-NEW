import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const signAccessToken = (payload: { uid: string; role: string }) =>
  jwt.sign(payload, SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: { uid: string; role: string }) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, SECRET) as { uid: string; role: string };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as { uid: string; role: string };
