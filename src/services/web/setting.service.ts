import { injectable } from "tsyringe";

import { Redis } from "@configs/redis";
import { ScoreScraperService } from "../scraper/score-scraper.service";
import { TimetableScraperService } from "../scraper/timetable-scraper.service";

@injectable()
export class SettingService {
  private readonly mssv: string = process.env.MSSV!;
  private readonly pass: string = process.env.PASS!;

  constructor(
    private readonly scoreScraperService: ScoreScraperService,
    private readonly timetableScraperService: TimetableScraperService
  ) {
    this.scoreScraperService.setMssv(this.mssv);
    this.scoreScraperService.setPass(this.pass);

    this.timetableScraperService.setMssv(this.mssv);
    this.timetableScraperService.setPass(this.pass);
  }

  public async getDataForViewSetting() {
    const [timetableSemesterList, scoreSemesterList] = await Promise.all([
      this.timetableScraperService.getSemester(),
      this.scoreScraperService.getSemester(),
    ]);

    if (!timetableSemesterList || !scoreSemesterList) {
      throw new Error("Cannot scrape data for view");
    }

    if (Array.isArray(timetableSemesterList) && Array.isArray(scoreSemesterList)) {
      // Default semester values
      const firstScoreSemester = scoreSemesterList[0];
      const selectedTimetableSemester = timetableSemesterList.find((ele) => ele.isSelected);

      // Chosen semester values
      const [chosenScoreSemester, chosenTimetableSemester] = await Promise.all([
        this.getScoreSemester(),
        this.getTimetableSemester(),
      ]);

      // If there are no chosen semesters, set default value
      await Promise.all([
        this.setScoreSemester(chosenScoreSemester ?? firstScoreSemester.NameTable),
        this.setTimetableSemester(chosenTimetableSemester ?? selectedTimetableSemester.value),
      ]);

      return {
        scoreSemesterList,
        timetableSemesterList,
        defaultScoreSemester: firstScoreSemester.TenHocKy,
        defaultTimetableSemester: selectedTimetableSemester.text,
      };
    }

    return null;
  }

  public async getScoreSemester() {
    const semesterScore = await Redis.getInstance().get("semester:score");
    return semesterScore;
  }

  public async setScoreSemester(chosenScoreSemester: string) {
    await Redis.getInstance().set("semester:score", chosenScoreSemester);
  }

  public async getTimetableSemester() {
    const semesterTimetable = await Redis.getInstance().get("semester:timetable");
    return semesterTimetable;
  }

  public async setTimetableSemester(chosenTimetableSemester: string) {
    await Redis.getInstance().set("semester:timetable", chosenTimetableSemester);
  }
}
