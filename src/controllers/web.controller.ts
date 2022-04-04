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
    if (data) {
      scoreSemesterList = data.scoreSemesterList ?? [];
      timetableSemesterList = data.timetableSemesterList ?? [];
      defaultScoreSemester = data.defaultScoreSemester ?? "Missing value";
      defaultTimetableSemester = data.defaultTimetableSemester ?? "Missing value";
    }

    const chosenScoreSemester = (await this.settingService.getScoreSemester()) ?? "";
    const chosenTimetableSemester = (await this.settingService.getTimetableSemester()) ?? "";

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

    await this.settingService.setScoreSemester(score);
    await this.settingService.setTimetableSemester(timetable);

    res.status(200).json({
      status: "success",
      data: null,
    });
  }
}
