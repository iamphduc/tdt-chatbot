import { Request, Response } from "express";
import { boundMethod } from "autobind-decorator";
import { injectable } from "tsyringe";

import { ScoreScraperService } from "../services/scraper/score-scraper.service";
import { TimetableScraperService } from "../services/scraper/timetable-scraper.service";

@injectable()
export class ApiController {
  constructor(
    private readonly scoreScraperService: ScoreScraperService,
    private readonly timetableScraperService: TimetableScraperService
  ) {}

  // [GET] /api/score
  @boundMethod
  public async getScoreBySemester(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    this.scoreScraperService.setMssv(mssv);
    this.scoreScraperService.setPass(pass);
    const scoreBySemester = await this.scoreScraperService.getBySemester();

    res.status(200).json(scoreBySemester);
  }

  // [GET] /api/score-overall
  @boundMethod
  public async getScoreOverall(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    this.scoreScraperService.setMssv(mssv);
    this.scoreScraperService.setPass(pass);
    const scoreOverall = await this.scoreScraperService.getOverall();

    res.status(200).json(scoreOverall);
  }

  // [GET] /api/week
  @boundMethod
  public async getTimetableThisWeek(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    this.timetableScraperService.setMssv(mssv);
    this.timetableScraperService.setPass(pass);
    const timetableThisWeek = await this.timetableScraperService.getThisWeek();

    res.status(200).json(timetableThisWeek);
  }

  // [GET] /api/week-next
  @boundMethod
  public async getTimeTableNextWeek(req: Request, res: Response): Promise<void> {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) {
      res.status(400).json({ message: "Missing mssv or pass" });
      return;
    }

    this.timetableScraperService.setMssv(mssv);
    this.timetableScraperService.setPass(pass);
    const timetableNextWeek = await this.timetableScraperService.getNextWeek();

    res.status(200).json(timetableNextWeek);
  }
}
