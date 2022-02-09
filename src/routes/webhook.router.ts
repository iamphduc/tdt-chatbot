import { Router } from "express";

import { WebhookController } from "../controllers/webhook.controller";

const webhookController = new WebhookController();

const webhookRouter = Router();

webhookRouter //
  .route("/")
  .get(webhookController.connect)
  .post(webhookController.handle);

export { webhookRouter };
