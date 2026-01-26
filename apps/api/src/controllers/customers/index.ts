import { customerListService } from "@/services/index.js";
import { apiResponse } from "@/utils/index.js";
import { Request, Response } from "express";

export const customerListController = async (req: Request, res: Response) => {
  try {
    const data = await customerListService();
    return apiResponse(res, 200, "Customer list fetched", data);
  } catch (error) {
    return res.status(500).json({ error });
  }
};
