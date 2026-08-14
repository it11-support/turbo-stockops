import {
  getPickListDetailService,
  getPickListDetailsService,
  getPickListService,
  getPickListsService,
  splitPickListService,
  storePickListService,
  updatePrintStatusService,
} from "@/services/picklist/index.js";
import { apiResponse } from "@/utils/index.js";
import { Request, Response } from "express";
import qs from "qs";

export const getPickListController = async (req: Request, res: Response) => {
  try {
    const data = await getPickListService();
    return apiResponse(res, 200, "Picklist fetched", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const storePickListController = async (req: Request, res: Response) => {
  const { TrnspCode, area, notes, picker, selectedIds, pickList, Customer } =
    req.body;
  try {
    const data = await storePickListService({
      Customer,
      selectedIds,
      TrnspCode,
      area,
      notes,
      picker,
      pickList,
    });
    return apiResponse(res, 200, "Picklist Created", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const getPickListsController = async (req: Request, res: Response) => {
  const query = qs.parse(req.url.split("?")[1]);
  try {
    const data = await getPickListsService({
      search: query.search as string,
      perPage: Number(query.per_page || 20),
      page: Number(query.page || 1),
      Status: query.Status as string,
      sortBy: query.sortBy as string,
      sortDesc: query.sortDesc === "true",
      date: query.date as string,
      isAdmin: query.isAdmin === "true",
      userId: Number(query.userId),
    });
    return apiResponse(res, 200, "Picklist fetched", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const getPickListDetailsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const data = await getPickListDetailsService(Number(id));
    return apiResponse(res, 200, "Picklist detail fetched", data);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const splitPickListController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { selectedIds } = req.body;
  try {
    const data = await splitPickListService(Number(id), selectedIds);
    return apiResponse(res, 200, "Picklist splited", data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const pickListsDetailController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }
    const user = req.user
    console.log(user)
    const pickListId = Number(req.params.id);

    const perPage = Number(req.query.per_page ?? 10);
    const page = Number(req.query.page ?? 1);
    const paging = req.query.paging === "true";

    const result = await getPickListDetailService({
      pickListId,
      user,
      perPage,
      page,
      paging,
    });

    return res.json({
      status: "ok",
      message: "Pick list details fetched successfully",
      ...result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePrintStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const data = await updatePrintStatusService(Number(id));
    return apiResponse(res, 200, "Print status updated", data);
  } catch (error) {
    return res.status(500).json({ error });
  }
}