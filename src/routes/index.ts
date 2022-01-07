import { Application } from "express";

import { WebhookController } from "src/controllers/webhook.controller";
import { ApiController } from "src/controllers/api.controller";
import { SettingController } from "src/controllers/setting.controller";

const webhookController = new WebhookController();
const apiController = new ApiController();
const settingController = new SettingController();

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
  app.get("/setting", settingController.getSetting);
  app.post("/setting", settingController.configurate);

  app.get("/", (req, res) => res.sendStatus(404));
};
