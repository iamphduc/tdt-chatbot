import { Request, Response } from "express";
import { boundMethod } from "autobind-decorator";
import { injectable } from "tsyringe";

import { SettingService } from "../services/web/setting.service";

interface ScoreSemester {
  id: number;
  TenHocKy: string;
  NameTable: string;
  TenHocKy_TA: string;
}

interface TimetableSemester {
  text: string;
  value: string;
  isSelected: boolean;
}

@injectable()
export class WebController {
  constructor(private readonly settingService: SettingService) {}

  // [GET] /
  public async renderViewHome(req: Request, res: Response) {
    res.render("home");
  }

  // [GET] /setting
  @boundMethod
  public async renderViewSetting(req: Request, res: Response) {
    const data = await this.settingService.getDataForViewSetting();

    let scoreSemesterList: ScoreSemester[] = [];
    let timetableSemesterList: TimetableSemester[] = [];
    let defaultScoreSemester = "";
    let defaultTimetableSemester = "";
    let chosenScoreSemester = "";
    let chosenTimetableSemester = "";

    if (data) {
      scoreSemesterList = data.scoreSemesterList ?? [];
      timetableSemesterList = data.timetableSemesterList ?? [];
      defaultScoreSemester = data.defaultScoreSemester ?? "Missing value";
      defaultTimetableSemester = data.defaultTimetableSemester ?? "Missing value";
      chosenScoreSemester = data.chosenScoreSemester ?? "";
      chosenTimetableSemester = data.chosenTimetableSemester ?? "";
    }

    res.render("setting", {
      scoreSemesterList,
      timetableSemesterList,
      defaultScoreSemester,
      defaultTimetableSemester,
      chosenScoreSemester,
      chosenTimetableSemester,
    });
  }

  // [POST] /setting
  @boundMethod
  public async handleConfigSetting(req: Request, res: Response) {
    const { score, timetable } = req.body;

    this.settingService.setChosenSemester(score, timetable);

    res.status(200).json({
      status: "success",
      data: null,
    });
  }
}
