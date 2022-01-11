import { Application } from "express";

import { ApiController } from "src/controllers/api.controller";
import { WebController } from "src/controllers/web.controller";
import { WebhookController } from "src/controllers/webhook.controller";

const apiController = new ApiController();
const webController = new WebController();
const webhookController = new WebhookController();

export const route = (app: Application) => {
  // webhook
  app.get("/webhook", webhookController.connect);
  app.post("/webhook", webhookController.handle);

  // api
  app.post("/api/week", apiController.getSchedule);
  app.post("/api/week-next", apiController.getScheduleNext);
  app.post("/api/score", apiController.getScore);
  app.post("/api/score-all", apiController.getScoreAll);

  // setting
  app.get("/setting", webController.getSetting);
  app.post("/setting", webController.configurate);

  app.get("/", (req, res) => res.sendStatus(404));
};
