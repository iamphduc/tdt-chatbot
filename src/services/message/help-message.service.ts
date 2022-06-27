import { boundMethod } from "autobind-decorator";
import { injectable } from "tsyringe";

import { Redis } from "@configs/redis";
import { SendAPIService } from "../facebook/send-api.service";

@injectable()
export class HelpMessageService {
  constructor(private readonly sendAPIService: SendAPIService) {}

  @boundMethod
  public async handleHelp() {
    const semesterList = (await Redis.getInstance().get("score:semester-list")) ?? "";
    const chosenScoreSemester = (await Redis.getInstance().get("semester:score")) ?? "";

    const semesterListParsed = JSON.parse(semesterList);
    const helpMessage = this.toMessage(semesterListParsed, chosenScoreSemester);

    const quickRepliesTitle = [
      "week",
      "week next",
      "today",
      "tomorrow",
      "score",
      "score all",
      "score list",
      `score -${chosenScoreSemester}`,
    ];

    const quickReplies = quickRepliesTitle.map((title: string) => ({
      content_type: "text",
      title,
      payload: "<POSTBACK_PAYLOAD>",
    }));

    await this.sendAPIService.callQuickReplies(helpMessage, quickReplies);
  }

  private toMessage(scoreSemesterList: any[], chosenScoreSemester: string) {
    /*
      "id":0,
      "TenHocKy":"Học kỳ 1/ 2021-2022",
      "NameTable":"Diem211",
      "TenHocKy_TA":"1st Semester/ 2021-2022"
    */
    const scoreSemesterText = scoreSemesterList.map(
      (ele: any) => `-${ele.NameTable}: ${ele.TenHocKy.replace("Học kỳ", "HK")}`
    );

    return (
      `========|  HELP  |========\n` +
      `\n` +
      `Xem lịch học:\n` +
      `  - Tuần này: "week"\n` +
      `  - Tuần sau: "week next"\n` +
      `  - Hôm nay: "today"\n` +
      `  - Ngày mai: "tomorrow"\n` +
      `  - Các ngày trong tuần: \n` +
      `     + "mon" là thứ 2\n` +
      `     + "tue" là thứ 3\n` +
      `     + ...\n` +
      `\n` +
      `Xem điểm:\n` +
      `  - HK mặc định: "score"\n` +
      `     + Hiện tại sẽ là: -${chosenScoreSemester}\n` +
      `  - Tổng hợp: "score all"\n` +
      `\n` +
      `Xem điểm theo học kỳ:\n` +
      `1. Sử dụng "score list"\n` +
      `2. Sử dụng "score -<NameTable>"\n` +
      `Ví dụ: "score -Diem20191"\n` +
      `\n` +
      `Danh sách NameTable:\n` +
      `${scoreSemesterText.reverse().join("\n")}`
    );
  }
}