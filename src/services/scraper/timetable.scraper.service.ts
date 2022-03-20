import * as cheerio from "cheerio";

import { SchoolScraperService } from "./school.scraper.service";
import { extractTimetable, extractTimetableSemester } from "./timetable.cheerio";

interface ASPNETVariable {
  __EVENTTARGET?: string;
  __EVENTARGUMENT?: string;
  __LASTFOCUS?: string;
  __VIEWSTATE?: string;
  __VIEWSTATEGENERATOR?: string;
}

export class TimetableScraperService extends SchoolScraperService {
  private readonly TIMETABLE_URL: string = "https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx";

  private async getASPNETVariable() {
    const { data } = await this.client({
      method: "GET",
      url: this.TIMETABLE_URL,
    });

    const $ = cheerio.load(data);
    const extracted: ASPNETVariable = {
      __EVENTTARGET: $("#__EVENTTARGET").val()?.toString(),
      __EVENTARGUMENT: $("#__EVENTARGUMENT").val()?.toString(),
      __LASTFOCUS: $("#__LASTFOCUS").val()?.toString(),
      __VIEWSTATE: $("#__VIEWSTATE").val()?.toString(),
      __VIEWSTATEGENERATOR: $("#__VIEWSTATEGENERATOR").val()?.toString(),
    };

    return extracted;
  }

  private async changeWeek(nextWeek = false) {
    const hiddenData: ASPNETVariable = await this.getASPNETVariable();

    let payload;
    if (!nextWeek) {
      // Similar to FormData
      payload = new URLSearchParams({
        ...hiddenData,
        ThoiKhoaBieu1$cboHocKy: process.env.SEMESTER_SCHEDULE || "",
        ThoiKhoaBieu1$radChonLua: "radXemTKBTheoTuan",
        ThoiKhoaBieu1$btnTuanHienTai: "",
      });
    } else {
      payload = new URLSearchParams({
        ...hiddenData,
        ThoiKhoaBieu1$cboHocKy: process.env.SEMESTER_SCHEDULE || "",
        ThoiKhoaBieu1$radChonLua: "radXemTKBTheoTuan",
        ThoiKhoaBieu1$btnTuanSau: "Tuần sau|Following week >>",
      });
    }

    await this.client({
      method: "POST",
      url: this.TIMETABLE_URL,
      data: payload,
    });
  }

  public async getThisWeek() {
    await super.login();

    await this.changeWeek();

    const { data } = await this.client({
      method: "GET",
      url: this.TIMETABLE_URL,
    });

    return extractTimetable(data);
  }

  public async getNextWeek() {
    await super.login();

    await this.changeWeek();
    await this.changeWeek(true);

    const { data } = await this.client({
      method: "GET",
      url: this.TIMETABLE_URL,
    });

    return extractTimetable(data);
  }

  public async getSemester() {
    await super.login();

    const { data } = await this.client({
      method: "GET",
      url: this.TIMETABLE_URL,
    });

    return extractTimetableSemester(data);
  }
}
