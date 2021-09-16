require('dotenv').config();

const Schedule = require('../modules/Schedule');
const Score = require('../modules/Score');

class ApiController {
  // [POST] /api/week
  async getSchedule(req, res) {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await Schedule.getSchedule(mssv, pass));
    } catch (err) {
      res.send(err);
    }
  }

  // [POST] /api/week-next
  async getScheduleNext(req, res) {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await Schedule.getSchedule(mssv, pass, true));
    } catch (err) {
      res.send(err);
    }
  }

  // [POST] /api/score
  async getScore(req, res) {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await Score.getScore(mssv, pass, undefined));
    } catch (err) {
      res.send(err);
    }
  }

  // [POST] /api/score-all
  async getScoreAll(req, res) {
    const { mssv, pass } = req.body;

    if (!mssv || !pass) return res.sendStatus(400);

    try {
      return res.json(await Score.getScoreAll(mssv, pass, undefined, true));
    } catch (err) {
      res.send(err);
    }
  }
}

module.exports = new ApiController();
