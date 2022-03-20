import { Router } from "express";

import { SettingService } from "../services/web/setting.service";
import { WebController } from "../controllers/web.controller";
import { catchAsync } from "../utils/catch-async";

const settingService = new SettingService();
const webController = new WebController(settingService);

const webRouter = Router();

webRouter //
  .route("")
  .get(catchAsync(webController.renderViewHome));

webRouter //
  .route("/setting")
  .get(catchAsync(webController.renderViewSetting))
  .post(catchAsync(webController.handleConfigSetting));

export { webRouter };
