/* eslint-disable arrow-body-style */
import { Request, Response, NextFunction } from "express";

// Handle try/catch error in async controllers.
export const catchAsync = (
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<unknown>
) => {
  // Return a middleware in catch error
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
};
