import cheerio from "cheerio";

import { SchoolScraperService } from "./school.scraper.service";

interface ScoreUrl {
  TrangChu: string;
  LayKetQuaHocTap: string;
  LayDTBHocKy: string;
  LayDiemTongHop: string;
  LayHocKy: string;
}

export class ScoreScraperService extends SchoolScraperService {
  private readonly SCORE_URL: ScoreUrl = {
    TrangChu: "https://ketquahoctap.tdtu.edu.vn",
    LayKetQuaHocTap: "https://ketquahoctap.tdtu.edu.vn/Home/LayKetQuaHocTap",
    LayDTBHocKy: "https://ketquahoctap.tdtu.edu.vn/Home/LayDTBHocKy",
    LayDiemTongHop: "https://ketquahoctap.tdtu.edu.vn/Home/LayDiemTongHop",
    LayHocKy: "https://ketquahoctap.tdtu.edu.vn/Home/LayHocKy_KetQuaHocTap",
  };

  private async getStudentData() {
    const { data } = await this.client({
      method: "GET",
      url: this.SCORE_URL.TrangChu,
    });

    const $ = cheerio.load(data);
    const extracted = {
      lop: $("#lop").text(),
      hedaotao: $("#hedaotao").text(),
      namvt: $("#namvt").text(),
    };

    return extracted;
  }

  public async getBySemester(semester = process.env.SEMESTER_SCORE || "") {
    await super.login();

    const studentData = await this.getStudentData();

    const { data: semesterScore } = await this.client({
      method: "GET",
      url: this.SCORE_URL.LayKetQuaHocTap,
      params: {
        mssv: this.mssv,
        nametable: semester,
        hedaotao: studentData.hedaotao,
        time: Date.now(),
      },
    });

    const { data: GPA } = await this.client({
      method: "GET",
      url: this.SCORE_URL.LayDTBHocKy,
      params: {
        lop: studentData.lop,
        mssv: this.mssv,
        tenBangDiem: semester,
        time: Date.now(),
      },
    });

    semesterScore.push(GPA);

    return semesterScore;
  }

  public async getOverall() {
    await super.login();

    const studentData = await this.getStudentData();

    const { data } = await this.client({
      method: "GET",
      url: this.SCORE_URL.LayDiemTongHop,
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

    const semester = await this.client({
      method: "GET",
      url: this.SCORE_URL.LayHocKy,
      params: {
        mssv: this.mssv,
        namvt: studentData.namvt,
        hedaotao: studentData.hedaotao,
        time: Date.now(),
      },
    });

    // globalize for webhook score message
    process.env.SCORE_OPTIONS = JSON.stringify(semester);

    return semester;
  }
}
