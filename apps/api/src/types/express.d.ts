import { users, Roles } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: users & {
        roles: Roles;
        isAdmin?: boolean;
      };
    }
  }
}

export {};
