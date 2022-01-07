import { Request, Response } from "express";

import { Schedule } from "../modules/Schedule";
import { Score } from "../modules/Score";

export class ApiController {
  readonly Schedule: Schedule;
  readonly Score: Score;

  constructor() {
    this.Schedule = new Schedule();
    this.Score = new Score();

    this.getSchedule = this.getSchedule.bind(this);
    this.getScheduleNext = this.getScheduleNext.bind(this);
    this.getScore = this.getScore.bind(this);
    this.getScoreAll = this.getScoreAll.bind(this);
  }

  // [POST] /api/week
  async getSchedule(req: Request, res: Response) {
    const { mssv, pass } = req.body;
    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await this.Schedule.getSchedule(mssv, pass));
    } catch (err) {
      res.send(err);
    }
  }

  // [POST] /api/week-next
  async getScheduleNext(req: Request, res: Response) {
    const { mssv, pass } = req.body;
    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await this.Schedule.getSchedule(mssv, pass, true));
    } catch (err) {
      res.send(err);
    }
  }

  // [POST] /api/score
  async getScore(req: Request, res: Response) {
    const { mssv, pass } = req.body;
    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await this.Score.getScore(mssv, pass, undefined));
    } catch (err) {
      res.send(err);
    }
  }

  // [POST] /api/score-all
  async getScoreAll(req: Request, res: Response) {
    const { mssv, pass } = req.body;
    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await this.Score.getScoreAll(mssv, pass));
    } catch (err) {
      res.send(err);
    }
  }
}
