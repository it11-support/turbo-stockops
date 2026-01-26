import type { Response } from "express";

export const apiResponse = (
  res: Response,
  status: number,
  message: string,
  data: any = null,
): Response => {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
  });
};
