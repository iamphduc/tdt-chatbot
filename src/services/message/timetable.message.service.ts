import { boundMethod } from "autobind-decorator";
import { injectable } from "tsyringe";

import { SendAPIService } from "../facebook/send-api.service";
import { UserService } from "../user/user.service";
import { TimetableScraperService } from "../scraper/timetable.scraper.service";

import timezone from "../../configs/timezone";

@injectable()
export class TimetableMessageService {
  constructor(
    private readonly sendAPIService: SendAPIService,
    private readonly userService: UserService
  ) {}

  @boundMethod
  public async handleThisWeek() {
    const { mssv, pass } = this.userService.getData();

    await this.sendAPIService.call(`Đợi mình lấy lịch học của tuần này nhé!`);

    const timetableScraperService = new TimetableScraperService(mssv, pass);
    const timetableThisWeek = await timetableScraperService.getThisWeek();

    const thisWeekMessage = this.toMessage(timetableThisWeek);
    if (!thisWeekMessage) {
      this.sendAPIService.call(`Không tìm thấy lịch học của tuần này`);
      return;
    }

    await this.sendAPIService.callMultiple(thisWeekMessage, 5);
  }

  @boundMethod
  public async handleNextWeek() {
    const { mssv, pass } = this.userService.getData();

    await this.sendAPIService.call(`Đợi mình lấy lịch học của tuần sau nhé!`);

    const timetableScraperService = new TimetableScraperService(mssv, pass);
    const timetableNextWeek = await timetableScraperService.getNextWeek();

    const nextWeekMessage = this.toMessage(timetableNextWeek);
    if (!nextWeekMessage) {
      this.sendAPIService.call(`Không tìm thấy lịch học của tuần sau`);
      return;
    }

    await this.sendAPIService.callMultiple(nextWeekMessage, 5);
  }

  @boundMethod
  public async handleWeekday(weekday: string) {
    const specialDay = {
      [timezone.TODAY]: "Hôm nay",
      [timezone.TOMORROW]: "Ngày mai",
    };
    const dateText = specialDay[weekday] ?? weekday;

    const { mssv, pass } = this.userService.getData();

    await this.sendAPIService.call(
      `Đợi mình lấy lịch học ${dateText !== "CN" && dateText.toLowerCase()} nhé!`
    );

    const timetableScraperService = new TimetableScraperService(mssv, pass);
    const timetableThisWeek = await timetableScraperService.getThisWeek();

    // There is no timetable for this week
    const timetableWeekday = timetableThisWeek.filter((ele) => ele.date.includes(weekday));
    if (timetableWeekday.length === 0) {
      this.sendAPIService.call(`${dateText} không có lịch học`);
      return;
    }

    // There is no timetable for this day
    const weekdayMessage = this.toMessage(timetableWeekday);
    if (!weekdayMessage) {
      this.sendAPIService.call(`${dateText} Không có lịch học`);
      return;
    }

    await this.sendAPIService.call({ text: weekdayMessage.join("\n") });
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
