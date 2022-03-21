import { Router } from "express";
import { container } from "tsyringe";

import { WebController } from "../controllers/web.controller";
import { catchAsync } from "../utils/catch-async";

const webController = container.resolve(WebController);

const webRouter = Router();

webRouter //
  .route("")
  .get(catchAsync(webController.renderViewHome));

webRouter //
  .route("/setting")
  .get(catchAsync(webController.renderViewSetting))
  .post(catchAsync(webController.handleConfigSetting));

export { webRouter };
