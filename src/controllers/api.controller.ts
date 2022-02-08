import { Request, Response } from "express";

import { ScoreScraperService } from "src/services/scraper/score.scraper.service";
import { TimetableScraperService } from "src/services/scraper/timetable.scraper.service";

export class ApiController {
  public async getScoreBySemester(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    const scoreService = new ScoreScraperService(mssv, pass);
    const scoreBySemester = await scoreService.getBySemester();

    res.status(200).json(scoreBySemester);
  }

  public async getScoreOverall(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    const scoreService = new ScoreScraperService(mssv, pass);
    const scoreOverall = await scoreService.getOverall();

    res.status(200).json(scoreOverall);
  }

  public async getTimetableThisWeek(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    const timetableService = new TimetableScraperService(mssv, pass);
    const timetableThisWeek = await timetableService.getThisWeek();

    res.status(200).json(timetableThisWeek);
  }

  public async getTimeTableNextWeek(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    const timetableService = new TimetableScraperService(mssv, pass);
    const timetableNextWeek = await timetableService.getNextWeek();

    res.status(200).json(timetableNextWeek);
  }
}
