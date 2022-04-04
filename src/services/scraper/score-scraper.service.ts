import * as cheerio from "cheerio";

import { Redis } from "@configs/redis";
import { TDTU_URL } from "@configs/url";
import { SchoolScraperService } from "./school-scraper.service";

export interface ScoreSemester {
  id: number;
  TenHocKy: string;
  NameTable: string;
  TenHocKy_TA: string;
}

export class ScoreScraperService extends SchoolScraperService {
  // Get student data hidden in homepage for next scraper
  private async getStudentData() {
    const { data } = await this.client({
      method: "GET",
      url: TDTU_URL.score.TrangChu,
    });

    const $ = cheerio.load(data);
    const extracted = {
      lop: $("#lop").text(),
      hedaotao: $("#hedaotao").text(),
      namvt: $("#namvt").text(),
    };

    return extracted;
  }

  public async getBySemester(_semester: string = "") {
    await super.login();

    const studentData = await this.getStudentData();

    let semester = _semester;
    if (!_semester) {
      semester = (await Redis.getInstance().get("semester:score")) ?? "";
    }

    const { data: score } = await this.client({
      method: "GET",
      url: TDTU_URL.score.LayKetQuaHocTap,
      params: {
        mssv: this.mssv,
        nametable: semester,
        hedaotao: studentData.hedaotao,
        time: Date.now(),
      },
    });

    const { data: GPA } = await this.client({
      method: "GET",
      url: TDTU_URL.score.LayDTBHocKy,
      params: {
        lop: studentData.lop,
        mssv: this.mssv,
        tenBangDiem: semester,
        time: Date.now(),
      },
    });

    score.push(GPA);

    return score;
  }

  public async getOverall() {
    await super.login();

    const studentData = await this.getStudentData();

    const { data } = await this.client({
      method: "GET",
      url: TDTU_URL.score.LayDiemTongHop,
      params: {
        mssv: this.mssv,
        namvt: studentData.namvt,
        hedaotao: studentData.hedaotao,
        time: Date.now(),
      },
    });

    return data;
  }

  public async getSemester() {
    await super.login();

    const studentData = await this.getStudentData();

    const { data } = await this.client({
      method: "GET",
      url: TDTU_URL.score.LayHocKy_KetQuaHocTap,
      params: {
        mssv: this.mssv,
        namvt: studentData.namvt,
        hedaotao: studentData.hedaotao,
        time: Date.now(),
      },
    });

    await Redis.getInstance().set("score:semester-list", JSON.stringify(data));

    return data;
  }
}
