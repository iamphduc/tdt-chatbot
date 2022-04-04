import * as cheerio from "cheerio";

import { Redis } from "@configs/redis";
import { TDTU_URL } from "@configs/url";
import { SchoolScraperService } from "./school-scraper.service";
import { extractTimetable, extractTimetableSemester } from "./timetable.cheerio";

interface ASPNETVariable {
  __EVENTTARGET?: string;
  __EVENTARGUMENT?: string;
  __LASTFOCUS?: string;
  __VIEWSTATE?: string;
  __VIEWSTATEGENERATOR?: string;
}

export class TimetableScraperService extends SchoolScraperService {
  private searchParams: string = "";

  private async getASPNETVariable() {
    const {
      data,
      request: { path },
    } = await this.client({
      method: "GET",
      url: TDTU_URL.timetable,
    });

    // eslint-disable-next-line prefer-destructuring
    this.searchParams = path.split("?")[1];

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
    const timetableSemester = (await Redis.getInstance().get("semester:timetable")) ?? "";

    // Similar to FormData
    let payload = new URLSearchParams({
      ...hiddenData,
      ThoiKhoaBieu1$cboHocKy: timetableSemester,
      ThoiKhoaBieu1$radChonLua: "radXemTKBTheoTuan",
      ThoiKhoaBieu1$btnTuanHienTai: "",
    });

    if (nextWeek) {
      payload = new URLSearchParams({
        ...hiddenData,
        ThoiKhoaBieu1$cboHocKy: timetableSemester,
        ThoiKhoaBieu1$radChonLua: "radXemTKBTheoTuan",
        ThoiKhoaBieu1$btnTuanSau: "Tuần sau|Following week >>",
      });
    }

    await this.client({
      method: "POST",
      url: `${TDTU_URL.timetable}?${this.searchParams}`,
      data: payload,
    });
  }

  public async getThisWeek() {
    await super.login();

    await this.changeWeek();

    const { data } = await this.client({
      method: "GET",
      url: TDTU_URL.timetable,
    });

    return extractTimetable(data);
  }

  // TODO Fix this!
  public async getNextWeek() {
    await super.login();

    await this.changeWeek();
    await this.changeWeek(true);

    const { data } = await this.client({
      method: "GET",
      url: TDTU_URL.timetable,
    });

    return extractTimetable(data);
  }

  public async getSemester() {
    await super.login();

    const { data } = await this.client({
      method: "GET",
      url: TDTU_URL.timetable,
    });

    return extractTimetableSemester(data);
  }
}
