import { Router } from "express";

import { ApiController } from "src/controllers/api.controller";

const apiController = new ApiController();

const apiRouter = Router();

apiRouter //
  .route("/week")
  .post(apiController.getTimetableThisWeek);

apiRouter //
  .route("/week-next")
  .post(apiController.getTimeTableNextWeek);

apiRouter //
  .route("/score")
  .post(apiController.getScoreBySemester);

apiRouter //
  .route("/score-overall")
  .post(apiController.getScoreOverall);

export { apiRouter };
