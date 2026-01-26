import prisma from "@/libs/prisma";
import { signJwt, verifyPassword } from "@/utils";

export const loginService = async (username: string, password: string) => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        OR: [{ email: username }, { username: username }],
      },
      include: {
        roles: true,
      },
    });

    const errors: Record<string, string> = {};

    if (!user) {
      errors.username = "User not found";
      throw { message: "Authentication failed, invalid credentials", errors };
    }

    const valid = await verifyPassword(password, user.password);

    if (!valid) {
      errors.password = "Password invalid";
      throw { message: "Authentication failed, invalid credentials", errors };
    }

    const token = signJwt({ sub: user.id }, "7d");

    const { password: _, roles, ...safeUser } = user;

    return {
      user: safeUser,
      token,
      roles,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
