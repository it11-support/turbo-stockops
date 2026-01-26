import { IUser } from "@turbo-stockops/types";
import { verifyJwt } from "@/utils/jwt";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import prisma from "@/libs/prisma";

export type IUserPayload = Omit<IUser, "role"> & {
  role: string;
} & JwtPayload;

export interface AuthRequest extends Request {}

export interface JwtUserPayload {
  sub: bigint;
  email: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt<JwtUserPayload>(token);

    const user = await prisma.users.findUnique({
      where: { id: decoded.sub },
      include: { roles: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    const isAdmin = ["admin", "superadmin"].includes(user.roles.role);

    req.user = {
      ...user,
      isAdmin,
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token." });
  }
};

export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.roles) {
      return res.status(403).json({ message: "User role not found" });
    }

    const userRole = user.roles.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
