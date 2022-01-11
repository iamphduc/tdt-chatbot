import { Router } from "express";

import { WebController } from "src/controllers/web.controller";

const webController = new WebController();

const webRouter = Router();

webRouter //
  .route("/setting")
  .get(webController.getSetting)
  .post(webController.configurate);

export { webRouter };
