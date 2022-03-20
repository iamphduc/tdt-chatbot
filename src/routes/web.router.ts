import { Router } from "express";

import { SettingService } from "../services/web/setting.service";
import { WebController } from "../controllers/web.controller";

const settingService = new SettingService();
const webController = new WebController(settingService);

const webRouter = Router();

webRouter //
  .route("")
  .get(webController.renderViewHome);

webRouter //
  .route("/setting")
  .get(webController.renderViewSetting)
  .post(webController.handleConfigSetting);

export { webRouter };
