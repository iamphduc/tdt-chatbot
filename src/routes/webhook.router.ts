import { Router } from "express";
import { container } from "tsyringe";

import { WebhookController } from "../controllers/webhook.controller";

const webhookController = container.resolve(WebhookController);

const webhookRouter = Router();

webhookRouter //
  .route("/")
  .get(webhookController.connect)
  .post(webhookController.handle);

export { webhookRouter };
