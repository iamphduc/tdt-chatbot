import { Router } from "express";

import { ApiController } from "../controllers/api.controller";
import { catchAsync } from "../utils/catch-async";

const apiController = new ApiController();

const apiRouter = Router();

apiRouter //
  .route("/week")
  .post(catchAsync(apiController.getTimetableThisWeek));

apiRouter //
  .route("/week-next")
  .post(catchAsync(apiController.getTimeTableNextWeek));

apiRouter //
  .route("/score")
  .post(catchAsync(apiController.getScoreBySemester));

apiRouter //
  .route("/score-overall")
  .post(catchAsync(apiController.getScoreOverall));

export { apiRouter };
