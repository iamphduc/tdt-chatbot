import { boundMethod } from "autobind-decorator";

import { SendAPIService } from "../facebook/send-api.service";
import { InforService } from "../infor/infor.service";
import { TimetableScraperService } from "../scraper/timetable.scraper.service";

import timezone from "../../configs/timezone";

export class TimetableMessageService {
  private readonly sender_psid: string;

  constructor(sender_psid: string) {
    this.sender_psid = sender_psid;
  }

  @boundMethod
  public async handleThisWeek() {
    const sendAPIService = new SendAPIService(this.sender_psid);
    const inforService = new InforService(this.sender_psid);

    const { mssv, pass } = inforService.get();
    const timetableScraperService = new TimetableScraperService(mssv, pass);

    await sendAPIService.call(`Đợi mình lấy lịch học của tuần này nhé!`);

    const timetableThisWeek = await timetableScraperService.getThisWeek();

    const thisWeekMessage = this.toMessage(timetableThisWeek);
    if (!thisWeekMessage) {
      sendAPIService.call(`Không tìm thấy lịch học của tuần này`);
      return;
    }

    await sendAPIService.callMultiple(thisWeekMessage, 5);
  }

  @boundMethod
  public async handleNextWeek() {
    const sendAPIService = new SendAPIService(this.sender_psid);
    const inforService = new InforService(this.sender_psid);

    const { mssv, pass } = inforService.get();
    const timetableScraperService = new TimetableScraperService(mssv, pass);

    await sendAPIService.call(`Đợi mình lấy lịch học của tuần sau nhé!`);

    const timetableNextWeek = await timetableScraperService.getNextWeek();

    const nextWeekMessage = this.toMessage(timetableNextWeek);
    if (!nextWeekMessage) {
      sendAPIService.call(`Không tìm thấy lịch học của tuần sau`);
      return;
    }

    await sendAPIService.callMultiple(nextWeekMessage, 5);
  }

  @boundMethod
  public async handleWeekday(weekday: string) {
    const specialDay = {
      [timezone.TODAY]: "Hôm nay",
      [timezone.TOMORROW]: "Ngày mai",
    };
    const dateText = specialDay[weekday] || weekday;

    const sendAPIService = new SendAPIService(this.sender_psid);
    const inforService = new InforService(this.sender_psid);

    const { mssv, pass } = inforService.get();
    const timetableScraperService = new TimetableScraperService(mssv, pass);

    await sendAPIService.call(
      `Đợi mình lấy lịch học ${dateText !== "CN" && dateText.toLowerCase()} nhé!`
    );

    const timetableThisWeek = await timetableScraperService.getThisWeek();

    const timetableWeekday = timetableThisWeek.filter((ele) => ele.date.includes(weekday));
    if (timetableWeekday.length === 0) {
      sendAPIService.call(`${dateText} không có lịch học`);
      return;
    }

    const weekdayMessage = this.toMessage(timetableWeekday);
    if (!weekdayMessage) {
      sendAPIService.call(`${dateText} Không có lịch học`);
      return;
    }

    await sendAPIService.call({ text: weekdayMessage.join("\n") });
  }

  private toMessage(timetable: any[]) {
    if (!timetable) return null;

    return timetable.map(
      (ele: any) =>
        `${ele.note === "" ? `===== ${ele.date} =====\n` : `##### ${ele.date} #####\n`}` +
        `Môn: ${ele.subject}\n` +
        `Tiết: ${ele.period}\n` +
        `Nhóm: ${ele.group}${ele.subGroup === 0 ? `` : `  -  Tổ: ${ele.subGroup}`}\n` +
        `Phòng: ${ele.room}\n` +
        `${ele.note === "" ? `` : `##### ${ele.note.toUpperCase()} #####\n`}`
    );
  }
}
