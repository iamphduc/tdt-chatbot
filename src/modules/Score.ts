/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-useless-constructor */
import cheerio from "cheerio";

import { School } from "./School";

const SCORE_URL = {
  HOME: "https://ketquahoctap.tdtu.edu.vn",
  SCORE: "https://ketquahoctap.tdtu.edu.vn/Home/LayKetQuaHocTap",
  GPA: "https://ketquahoctap.tdtu.edu.vn/Home/LayDTBHocKy",
  ALL: "https://ketquahoctap.tdtu.edu.vn/Home/LayDiemTongHop",
  SEMESTER: "https://ketquahoctap.tdtu.edu.vn/Home/LayHocKy_KetQuaHocTap",
};

export class Score extends School {
  constructor() {
    super();
  }

  // ===== GET SCORE DATA ===== //
  async getScoreData() {
    try {
      console.time("Score home");
      const scoreHome = await this.rp({
        uri: SCORE_URL.HOME,
      });
      console.timeEnd("Score home");

      // cheerio
      const $ = cheerio.load(scoreHome);
      const data = {
        lop: $("#lop").text(),
        hedaotao: $("#hedaotao").text(),
        namvt: $("#namvt").text(),
      };

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // ===== SCORE + GPA ===== //
  async getScore(mssv: string, pass: string, semester = process.env.SEMESTER_SCORE) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return "Login failed";

      const { lop, hedaotao } = await this.getScoreData();

      // request score
      console.time("Score");
      const score = await this.rp({
        uri: SCORE_URL.SCORE,
        qs: { mssv, nametable: semester, hedaotao, time: Date.now() },
        json: true,
      });
      console.timeEnd("Score");

      // request gpa
      console.time("GPA");
      const GPA = await this.rp({
        uri: SCORE_URL.GPA,
        qs: { lop, mssv, tenBangDiem: semester, time: Date.now() },
        json: true,
      });
      console.timeEnd("GPA");

      score.push(GPA);

      return score;
    } catch (error) {
      console.log(error);
    }
  }

  // ===== SCORE ALL ===== //
  async getScoreAll(mssv: string, pass: string) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return "Login failed";

      const { hedaotao, namvt } = await this.getScoreData();

      // request score total
      console.time("Score total");
      const scoreTotal = await this.rp({
        uri: SCORE_URL.ALL,
        qs: { mssv, namvt, hedaotao, time: Date.now() },
        json: true,
      });
      console.timeEnd("Score total");

      return scoreTotal;
    } catch (error) {
      console.log(error);
    }
  }

  // ===== SCORE SEMESTER ===== //
  async getScoreSemester(mssv: string, pass: string) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return "Login failed";

      const { hedaotao, namvt } = await this.getScoreData();

      // request score semester
      console.time("Score semester");
      const scoreSemester = await this.rp({
        uri: SCORE_URL.SEMESTER,
        qs: { mssv, namvt, hedaotao, time: Date.now() },
        json: true,
      });
      console.timeEnd("Score semester");

      // globalize for webhook score message
      process.env.SCORE_OPTIONS = JSON.stringify(scoreSemester);

      return scoreSemester;
    } catch (error) {
      console.log(error);
    }
  }
}
