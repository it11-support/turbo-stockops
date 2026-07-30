import { usersWhereInput } from "@/generated/prisma/models/users.js";
import prisma from "@/libs/prisma/index.js";
import bcrypt from "bcryptjs";

type UserListParams = {
  search?: string;
  perPage: number;
  role?: string;
  sort?: string;
  page: number;
};

type UserRegisterParams = {
  email: string;
  isEdit: boolean;
  name: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  username: string;
};

export const getPickersService = async () => {
  try {
    const pickers = await prisma.users.findMany({
      where: {
        roles: {
          is: {
            role: "picker",
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return pickers;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const userListService = async (params: UserListParams) => {
  try {
    const { search, perPage, role, sort, page } = params;

    const where: usersWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
          },
        },
        {
          username: {
            contains: search,
          },
        },
        {
          roles: {
            is: {
              role: {
                contains: search,
              },
            },
          },
        },
      ];
    }

    if (role) {
      const roleIds = role
        ? role
            .split(",")
            .map((r) => Number(r.trim()))
            .filter((r) => !isNaN(r))
        : [];

      where.OR = [
        ...(where.OR ?? []),
        {
          roles: {
            id: {
              in: roleIds,
            },
          },
        },
      ];
    }

    const users = await prisma.users.findMany({
      where,
      orderBy: {
        [sort ?? "created_at"]: "desc",
      },
      include: {
        roles: true,
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    const total = await prisma.users.count({
      where,
    });

    const formatted = users.map((u) => {
      const { roles, ...rest } = u;
      return {
        ...rest,
        role: roles,
      };
    });

    const data = {
      data: formatted,
      total,
    };
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const userRegisterService = async (params: UserRegisterParams) => {
  try {
    const {
      email,
      isEdit,
      name,
      password,
      password_confirmation,
      role_id,
      username,
    } = params;

    if (password !== password_confirmation) {
      throw { message: "Passwords don't match." };
    }

    const user = await prisma.users.create({
      data: {
        email,
        name,
        password,
        username,
        roles: {
          connect: {
            id: role_id,
          },
        },
      },
      include: {
        roles: true,
      },
    });

    const data = {
      ...user,
      role: user.roles,
    };

    return data;
  } catch (error) {}
};

export const userUpdateService = async (
  id: number,
  params: UserRegisterParams,
) => {
  try {
    const { email, name, password, password_confirmation, role_id, username } =
      params;

    const user = await prisma.users.findUnique({
      where: {
        id,
      },
      include: {
        roles: true,
      },
    });
    if (!user) {
      throw { message: "User not found." };
    }
    if (username) {
      const usernameExists = await prisma.users.findFirst({
        where: {
          username,
          NOT: {
            id,
          },
        },
      });

      if (usernameExists && Number(usernameExists.id) !== id) {
        throw { message: "Username already exists." };
      }
    }
    if (email) {
      const emailExists = await prisma.users.findFirst({
        where: {
          email,
          NOT: {
            id,
          },
        },
      });

      if (emailExists && Number(emailExists.id) !== id) {
        throw { message: "Email already exists." };
      }
      const updateData: any = {
        name,
        username,
        email,
        roles: {
          connect: {
            id: role_id,
          },
        },
      };
      if (password) {
        if (password.length < 8) {
          throw { message: "Password must be at least 8 characters long." };
        }
        if (password !== password_confirmation) {
          throw { message: "Passwords don't match." };
        }
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updateUser = await prisma.users.update({
        where: {
          id,
        },
        data: updateData,
        include: {
          roles: true,
        },
      });

      const data = {
        ...updateUser,
        role: updateUser.roles,
      };

      return data;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUserService = async (id: number) => {
  try {
    const deletedUser = await prisma.users.delete({
      where: {
        id,
      },
    });
    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
