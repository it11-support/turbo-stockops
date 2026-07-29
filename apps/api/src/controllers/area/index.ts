import { areaListService } from "@/services/area/index.js";
import { apiResponse, errorResponse } from "@/utils/index.js";
import { Request, Response } from "express";

export const areaListController = async (req: Request, res: Response) => {
  try {
    const data = await areaListService();
    return apiResponse(res, 200, "Area list fetched", data);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error, 500, "Failed to fetch areas");
  }
};
