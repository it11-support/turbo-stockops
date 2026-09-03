import type { Response } from "express";

export const apiResponse = (
  res: Response,
  status: number,
  message: string,
  data: unknown = null,
): Response => {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  error: unknown,
  status = 500,
  message = 'Internal server error',
) => {
  console.error(error)

  return res.status(status).json({
    success: false,
    message,
  })
}
