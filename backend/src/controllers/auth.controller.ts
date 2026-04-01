import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth.middleware";

// Response shape matches frontend UserProfile interface:
// { uid, email, displayName, photoURL?, role, createdAt }
const safeUser = (user: any) => ({
  uid: user.id,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  role: user.role,
  createdAt: user.createdAt.getTime(), // number (timestamp) to match frontend
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) throw new AppError("All fields required", 400);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError("Email already in use", 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, displayName, role: "user" },
    });

    const profile = safeUser(user);
    const accessToken = signAccessToken({ uid: user.id, role: user.role });
    const refreshToken = signRefreshToken({ uid: user.id, role: user.role });

    res.status(201).json({ user: profile, accessToken, refreshToken });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError("Email and password required", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const profile = safeUser(user);
    const accessToken = signAccessToken({ uid: user.id, role: user.role });
    const refreshToken = signRefreshToken({ uid: user.id, role: user.role });

    res.json({ user: profile, accessToken, refreshToken });
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError("Refresh token required", 400);
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ uid: decoded.uid, role: decoded.role });
    res.json({ accessToken });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    if (!user) throw new AppError("User not found", 404);
    res.json(safeUser(user));
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { displayName, photoURL } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.uid },
      data: { displayName, photoURL },
    });
    res.json(safeUser(user));
  } catch (err) { next(err); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    if (!user) throw new AppError("User not found", 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new AppError("Current password is incorrect", 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ message: "Password updated successfully" });
  } catch (err) { next(err); }
};
