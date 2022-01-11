import { Router } from "express";

import { ApiController } from "src/controllers/api.controller";

const apiController = new ApiController();

const apiRouter = Router();

apiRouter //
  .route("/week")
  .post(apiController.getSchedule);

apiRouter //
  .route("/week-next")
  .post(apiController.getScheduleNext);

apiRouter //
  .route("/score")
  .post(apiController.getScore);

apiRouter //
  .route("/score-all")
  .post(apiController.getScoreAll);

export { apiRouter };
