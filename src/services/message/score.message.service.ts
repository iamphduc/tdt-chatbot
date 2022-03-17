import { boundMethod } from "autobind-decorator";

import { SendAPIService } from "../facebook/send-api.service";
import { InforService } from "../infor/infor.service";
import { ScoreScraperService, ScoreSemester } from "../scraper/score.scraper.service";

export class ScoreMessageService {
  private readonly sender_psid: string;

  constructor(sender_psid: string) {
    this.sender_psid = sender_psid;
  }

  private findTenHocKyFromNameTable(nameTable: string) {
    /*
      "id":0,
      "TenHocKy":"Học kỳ 1/ 2021-2022",
      "NameTable":"Diem211",
      "TenHocKy_TA":"1st Semester/ 2021-2022"
    */

    const semesterList = JSON.parse(process.env.SCORE_OPTIONS || "");

    const semesterFound = semesterList.find(
      (semester: ScoreSemester) => semester.NameTable === nameTable
    );

    // Check if invalid NameTable for score custom
    if (!semesterFound) {
      return null;
    }

    return semesterFound.TenHocKy;
  }

  @boundMethod
  public async handleByNameTable(nameTable: string = process.env.SEMESTER_SCORE!) {
    const sendAPIService = new SendAPIService(this.sender_psid);
    const inforService = new InforService(this.sender_psid);

    const { mssv, pass } = inforService.get();
    const scoreScraperService = new ScoreScraperService(mssv, pass);

    const semesterName = this.findTenHocKyFromNameTable(nameTable);
    if (!semesterName) {
      sendAPIService.call(`Không tìm thấy bảng điểm ${semesterName}`);
      return;
    }

    await sendAPIService.call(`Đợi mình lấy điểm ${semesterName} nhé!`);

    const scoreBySemester = await scoreScraperService.getBySemester();

    const scoreMessage = this.toMessage(scoreBySemester);
    if (!scoreMessage) {
      sendAPIService.call(`Không tìm thấy bảng điểm ${semesterName}`);
      return;
    }

    await sendAPIService.callMultiple(scoreMessage);
  }

  private toMessage(scoreArr: any[]) {
    if (!scoreArr) return null;

    return scoreArr.map((ele: any, i: number) => {
      // GPA
      if (i + 1 === scoreArr.length) {
        if (!ele) {
          return `########   GPA   ########\n--->  Không có điểm\n`;
        }

        /*
          "ID": 507447,
          "MSSV": "51900790",
          "LopID": "19050402",
          "NHHK": null,
          "DTBHocKy": "8.06",
          "TCDat": "14",
          "DTBTL": "7.93",
          "TCTL": "57"
        */
        return (
          `########   GPA   ########\n` +
          `ĐTB học kỳ: ${ele.DTBHocKy}\n` +
          `Tín chỉ đạt: ${ele.TCDat}\n` +
          `ĐTB tích luỹ: ${ele.DTBTL}\n` +
          `Tín chỉ tích luỹ: ${ele.TCTL}\n`
        );
      }

      /* 
        "MSSV": "51900790",
        "MonHocID": "503073",
        "TenMH": "Lập trình web và ứng dụng",
        "TenMH_TA": "Web Programming and Applications",
        "Nhom_To": "23",
        "Diem1": "9.0",
        "Diem2": "10",
        "DiemThi1": "6.0",
        "DiemThi2": "",
        "DTB": "7.7",
        "SoTC": "3",
        "NgayCongBoDTB": "2021-06-18 18:43:55",
        "NgayCongBoDiemThi1": "2021-06-18 18:43:55",
        "NgayCongBoDiemThi2": "",
        "NgayCongBoDiem1": "2021-06-18 18:43:55",
        "NgayCongBoDiem2": "2021-04-12 16:56:41",
        "Diem1_1": "9.0",
        "NgayCongBoDiem1_1": "2021-06-04 20:21:55",
        "GhiChu": ""
      */
      return (
        `========|  [ ${i + 1} ]  |========\n` +
        `Môn: ${this.formatLongTenMH(ele.TenMH)}\n` +
        `Mã môn: ${ele.MonHocID}\n` +
        `Nhóm: ${ele.Nhom_To}  |  Tín chỉ: ${ele.SoTC}\n` +
        `QT_1: ${ele.Diem1}  -  QT_2: ${ele.Diem1_1}\n` +
        `Giữa kỳ: ${ele.Diem2}  -  Cuối kỳ: ${ele.DiemThi1}\n` +
        `----->  ĐTB: ${ele.DTB}  <-----\n` +
        `Ghi chú: ${ele.GhiChu === "" ? "không" : ele.GhiChu}\n`
      );
    });
  }

  private formatLongTenMH(tenMH: string) {
    return tenMH
      .replace("Những kỹ năng thiết yếu cho sự phát triển bền vững - ", "")
      .replace("Công nghệ thông tin", "CNTT");
  }

  @boundMethod
  public async handleOverall() {
    const sendAPIService = new SendAPIService(this.sender_psid);
    const inforService = new InforService(this.sender_psid);

    const { mssv, pass } = inforService.get();
    const scoreScraperService = new ScoreScraperService(mssv, pass);

    await sendAPIService.call(`Đợi mình lấy điểm tổng hợp nhé!`);

    const scoreOverall = await scoreScraperService.getOverall();

    const scoreMessage = this.toOverallMessage(scoreOverall);
    if (!scoreMessage) {
      sendAPIService.call(`Không tìm thấy bảng điểm tổng hợp`);
      return;
    }

    await sendAPIService.callMultiple(scoreMessage);
  }

  private toOverallMessage(scoreOverallArr: any[]) {
    if (!scoreOverallArr) return null;

    /* 
      "MSSV": "51900790",
      "MonHocID": "302053",
      "TenMH": "Pháp luật đại cương",
      "TenMH_TA": "Introduction to Laws",
      "Nhom_To": null,
      "Diem1": null,
      "Diem2": null,
      "DiemThi1": null,
      "DiemThi2": null,
      "DTB": "8.2",
      "SoTC": "2",
      "NgayCongBoDTB": null,
      "NgayCongBoDiemThi1": null,
      "NgayCongBoDiemThi2": null,
      "NgayCongBoDiem1": null,
      "NgayCongBoDiem2": null,
      "Diem1_1": null,
      "NgayCongBoDiem1_1": null,
      "GhiChu": null
    */

    return scoreOverallArr.map(
      (ele: any, i: number) =>
        `========|  [ ${i + 1} ]  |========\n` +
        `Môn: ${this.formatLongTenMH(ele.TenMH)}\n` +
        `Mã môn: ${ele.MonHocID}\n` +
        `Tín chỉ: ${ele.SoTC}\n` +
        `----->  ĐTB: ${ele.DTB}  <-----\n`
    );
  }

  @boundMethod
  public async handleSemesterList() {
    const semesterList = JSON.parse(process.env.SCORE_OPTIONS || "").reverse();

    const elements = [];
    // Split semester list into chuck of 3 buttons
    for (let i = 0; i < semesterList.length; i += 3) {
      const options = semesterList.slice(i, i + 3);

      const buttons = options.map((option: any) => ({
        type: "postback",
        title: option.TenHocKy,
        payload: `score -${option.NameTable}`,
      }));

      elements.push({
        title: "Chọn học kỳ mà bạn muốn xem điểm!",
        buttons,
      });
    }

    const sendAPIService = new SendAPIService(this.sender_psid);

    await sendAPIService.callGenericTemplate(elements);
  }
}
