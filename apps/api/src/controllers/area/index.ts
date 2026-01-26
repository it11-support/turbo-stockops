import { areaListService } from "@/services/area/index.js";
import { apiResponse } from "@/utils/index.js";
import { Request, Response } from "express";

export const areaListController = async (req: Request, res: Response) => {
  try {
    const data = await areaListService();
    return apiResponse(res, 200, "Area list fetched", data);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};
