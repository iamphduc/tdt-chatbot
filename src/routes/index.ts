import { Application, Request, Response, NextFunction } from "express";

import { apiRouter } from "./api.router";
import { webRouter } from "./web.router";
import { webhookRouter } from "./webhook.router";

import logger from "../configs/logger";

export const route = (app: Application) => {
  app.use("/", webRouter);
  app.use("/api", apiRouter);
  app.use("/webhook", webhookRouter);

  // Error - 404
  app.use((req: Request, res: Response) => {
    res.sendStatus(404);
  });

  // Error - 500
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    res.sendStatus(500);
  });
};
