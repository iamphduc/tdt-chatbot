import { Application } from "express";

import { apiRouter } from "./api.router";
import { webRouter } from "./web.router";
import { webhookRouter } from "./webhook.router";

export const route = (app: Application) => {
  app.use("/", webRouter);
  app.use("/api", apiRouter);
  app.use("/webhook", webhookRouter);

  // 404
  app.use((req, res) => res.sendStatus(404));
};
