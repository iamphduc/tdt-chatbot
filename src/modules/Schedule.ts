/* eslint-disable @typescript-eslint/no-useless-constructor */
import cheerio from "cheerio";

import { School } from "./School";
import { cheerioSchedule, cheerioScheduleSemester } from "./cheerio";

const SCHEDULE_URL = "https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx";

export class Schedule extends School {
  constructor() {
    super();
  }

  // ===== GET SCHEDULE DATA ===== //
  async getScheduleData(noData = false) {
    try {
      console.time("Schedule page");
      const schedulePage = await this.rp({
        uri: SCHEDULE_URL,
        resolveWithFullResponse: true,
      });
      console.timeEnd("Schedule page");

      // cheerio
      const $ = cheerio.load(schedulePage.body);

      // for schedule semester
      if (noData) return $;

      const data = {
        search: schedulePage.request.uri.search,
        __EVENTTARGET: $("#__EVENTTARGET").val(),
        __EVENTARGUMENT: $("#__EVENTARGUMENT").val(),
        __LASTFOCUS: $("#__LASTFOCUS").val(),
        __VIEWSTATE: $("#__VIEWSTATE").val(),
        __VIEWSTATEGENERATOR: $("#__VIEWSTATEGENERATOR").val(),
      };

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  // ===== CHANGE SCHEDULE ===== //
  async changeSchedule(data: any, next = false) {
    try {
      const { search, ...others } = data;

      const formData = {
        ...others,
        ThoiKhoaBieu1$cboHocKy: process.env.SEMESTER_SCHEDULE,
        ThoiKhoaBieu1$radChonLua: "radXemTKBTheoTuan",
      };

      if (next) formData.ThoiKhoaBieu1$btnTuanSau = "Tuần sau|Following week >>";
      else formData.ThoiKhoaBieu1$btnTuanHienTai = "";

      console.time("Change schedule");
      await this.rp({
        method: "POST",
        uri: SCHEDULE_URL + search,
        formData,
        simple: false,
      });
      console.timeEnd("Change schedule");
    } catch (error) {
      console.log(error);
    }
  }

  // ===== GET SCHEDULE ===== //
  async getSchedule(mssv: string, pass: string, next = false) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return "Login failed";

      const data = await this.getScheduleData();
      await this.changeSchedule(data);

      // CURRENT SCHEDULE
      console.time("Current schedule");
      const currentSchedule = await this.rp({
        uri: SCHEDULE_URL,
      });
      console.timeEnd("Current schedule");

      if (!next) return cheerioSchedule(currentSchedule);

      // NEXT SCHEDULE
      console.time("Next schedule");
      await this.changeSchedule(data, true); // next = true
      const nextSchedule = await this.rp({
        uri: SCHEDULE_URL,
      });
      console.timeEnd("Next schedule");

      return cheerioSchedule(nextSchedule);
    } catch (error) {
      console.log(error);
    }
  }

  async getScheduleSemester(mssv: string, pass: string) {
    try {
      console.log("hello");
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return "Login failed";

      const $ = await this.getScheduleData(true);

      const scheduleSemester = cheerioScheduleSemester($);

      return scheduleSemester;
    } catch (error) {
      console.log(error);
    }
  }
}
