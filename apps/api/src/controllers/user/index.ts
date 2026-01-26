import {
  deleteUserService,
  getPickersService,
  userListService,
  userRegisterService,
  userUpdateService,
} from "@/services";
import { apiResponse, PERPAGE } from "@/utils";
import { Request, Response } from "express";

export const getPickersController = async (req: Request, res: Response) => {
  try {
    const data = await getPickersService();
    return apiResponse(res, 200, "Pickers fetched", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const userListController = async (req: Request, res: Response) => {
  try {
    const { page, per_page: perPage, search, sort, role } = req.query;
    const data = await userListService({
      search: search as string,
      perPage: Number(perPage || PERPAGE),
      page: Number(page || 1),
      role: role as string,
      sort: sort as string,
    });
    return apiResponse(res, 200, "User list fetched", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const userRegisterController = async (req: Request, res: Response) => {
  try {
    const {
      email,
      isEdit,
      name,
      password,
      password_confirmation,
      role_id,
      username,
    } = req.body;
    const data = await userRegisterService({
      email,
      isEdit,
      name,
      password,
      password_confirmation,
      role_id,
      username,
    });
    return apiResponse(res, 200, "User created", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const userUpdateController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const params = req.body;
    const data = await userUpdateService(id, params);
    return apiResponse(res, 200, "User updated", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await deleteUserService(id);
    return apiResponse(res, 200, "User deleted", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};
