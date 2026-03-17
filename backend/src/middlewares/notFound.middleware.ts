import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@utils/response';

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
