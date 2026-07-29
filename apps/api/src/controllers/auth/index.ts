import { loginService } from "@/services/index.js";
import { apiResponse, errorResponse } from "@/utils/index.js";
import { Request, Response } from "express";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const response = await loginService(username, password);

    const { user, roles, token } = response;

    const data = {
      auth_type: "Bearer",
      ...user,
      role: roles,
      token,
    };
    return apiResponse(res, 200, "Login successful", data);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error, 500, "Login failed");
  }
};
