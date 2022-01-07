import { Request, Response } from "express";

import { Schedule } from "src/modules/Schedule";
import { Score } from "src/modules/Score";

export class SettingController {
  readonly Schedule: Schedule;
  readonly Score: Score;

  constructor() {
    this.Schedule = new Schedule();
    this.Score = new Score();

    this.getSetting = this.getSetting.bind(this);
    this.configurate = this.configurate.bind(this);
  }

  // [GET] /setting
  async getSetting(req: Request, res: Response) {
    try {
      const { MSSV = "", PASS = "", CONFIG = "" } = process.env;

      const [scheduleOptions, scoreOptions] = await Promise.all([
        this.Schedule.getScheduleSemester(MSSV, PASS),
        this.Score.getScoreSemester(MSSV, PASS),
      ]);

      if (scheduleOptions && Array.isArray(scheduleOptions)) {
        const defaultSchedule = scheduleOptions.find((ele) => ele.isSelected);
        const defaultScore = scoreOptions[0];

        const { SCHEDULE: configSchedule = "", SCORE: configScore = "" } = CONFIG
          ? JSON.parse(CONFIG)
          : {};

        setSemester(configSchedule || defaultSchedule.value, configScore || defaultScore.NameTable);
        console.log(process.env.SEMESTER_SCHEDULE, process.env.SEMESTER_SCORE);

        return res.render("setting", {
          scheduleOptions,
          scoreOptions,
          configSchedule,
          configScore,
        });
      }

      return res.render("setting");
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Oops! Something wrong" });
    }
  }

  // [POST] /setting
  configurate(req: Request, res: Response) {
    const { configSchedule, configScore } = req.body;

    process.env.CONFIG = JSON.stringify({
      SCHEDULE: configSchedule,
      SCORE: configScore,
    });

    setSemester(configSchedule, configScore);
    console.log("SETTING_SUCCESS");
    console.log(process.env.SEMESTER_SCHEDULE, process.env.SEMESTER_SCORE);

    return res.status(200).json({ message: "success" });
  }
}

function setSemester(schedule: any, score: any) {
  if (schedule) process.env.SEMESTER_SCHEDULE = schedule;
  if (score) process.env.SEMESTER_SCORE = score;
}
