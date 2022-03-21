import { ScoreScraperService } from "../scraper/score.scraper.service";
import { TimetableScraperService } from "../scraper/timetable.scraper.service";

export class SettingService {
  public async getDataForViewSetting() {
    const mssv = process.env.MSSV!;
    const pass = process.env.PASS!;

    const scoreScraperService = new ScoreScraperService(mssv, pass);
    const timetableScraperService = new TimetableScraperService(mssv, pass);

    const [timetableSemesterList, scoreSemesterList] = await Promise.all([
      timetableScraperService.getSemester(),
      scoreScraperService.getSemester(),
    ]);

    if (!timetableSemesterList || !scoreSemesterList) {
      throw new Error("Cannot scrape data for view");
    }

    if (Array.isArray(timetableSemesterList) && Array.isArray(scoreSemesterList)) {
      const firstScoreSemester = scoreSemesterList[0];
      const selectedTimetableSemester = timetableSemesterList.find((ele) => ele.isSelected);

      this.setChosenSemester(
        process.env.SEMESTER_SCORE ?? firstScoreSemester.NameTable,
        process.env.SEMESTER_SCHEDULE ?? selectedTimetableSemester.value
      );

      return {
        scoreSemesterList,
        timetableSemesterList,
        defaultScoreSemester: firstScoreSemester.TenHocKy,
        defaultTimetableSemester: selectedTimetableSemester.text,
      };
    }

    return null;
  }

  public getChosenSemester() {
    return {
      chosenScoreSemester: process.env.SEMESTER_SCORE,
      chosenTimetableSemester: process.env.SEMESTER_SCHEDULE,
    };
  }

  public setChosenSemester(chosenScoreSemester: string, chosenTimetableSemester: string) {
    // Globalize for scraper service
    process.env.SEMESTER_SCORE = chosenScoreSemester;
    process.env.SEMESTER_SCHEDULE = chosenTimetableSemester;
  }
}
