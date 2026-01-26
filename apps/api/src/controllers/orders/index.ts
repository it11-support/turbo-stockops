import {
  activeOrderService,
  exportOrdersService,
  getOrderDetailsService,
  orderIdListService,
  orderListService,
} from "@/services/orders";
import { apiResponse } from "@/utils";
import { Request, Response } from "express";
import qs from "qs";

export const activeOrderController = async (req: Request, res: Response) => {
  try {
    const data = await activeOrderService();
    return apiResponse(res, 200, "Active order fetched", data);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

export const orderIdListController = async (req: Request, res: Response) => {
  try {
    const data = await orderIdListService();
    return apiResponse(res, 200, "Order id list fetched", data);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

export const orderListController = async (req: Request, res: Response) => {
  const query = qs.parse(req.url.split("?")[1]);
  try {
    const data = await orderListService({
      master: query.master === "true",
      search: query.search as string,
      perPage: Number(query.per_page || 20),
      page: Number(query.page || 1),
      due_date: query.due_date as string,
      sortBy: query.sortBy as string,
      sortDesc: query.sortDesc === "true",
      DocNum: query.DocNum as string,
      TrnspCode: query.TrnspCode as string,
      Customer: query.Customer as string,
    });
    return res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const getOrderDetailsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const data = await getOrderDetailsService(Number(id));
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const orderExportController = async (req: Request, res: Response) => {
  try {
    const date = req.body.date as string;
    const data = await exportOrdersService(date);
    return res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};
