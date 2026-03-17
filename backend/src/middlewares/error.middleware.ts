/* Example usage:

In normal functions:

import { Request, Response, NextFunction } from "express";

export const testRoute = (req: Request, res: Response, next: NextFunction) => {
  try {
    throw { status: 401, message: "Unauthorized" };
  } catch (err) {
    next(err); // Forward to error middleware
  }
};

In async functions:

import { Request, Response, NextFunction } from "express";

export const testAsyncRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Some async operation that fails
    await Promise.reject({ status: 404, message: "Not Found" });
  } catch (err) {
    next(err); // Forward to error middleware
  }
};

*/

import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@utils/response';

interface ErrorWithStatus extends Error {
  status?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, status, err);
};
