import { SendAPIService } from "../facebook/send-api.service";
import { InforService } from "../infor/infor.service";

import { HelpMessageService } from "../message/help.message.service";
import { TimetableMessageService } from "../message/timetable.message.service";
import { ScoreMessageService } from "../message/score.message.service";

import timezone from "../../configs/timezone";

export class WebhookService {
  private readonly sendAPIService: SendAPIService;
  private readonly inforService: InforService;
  private readonly helpMessageService: HelpMessageService;
  private readonly scoreMessageService: ScoreMessageService;
  private readonly timetableMessageService: TimetableMessageService;

  constructor(
    sendAPIService: SendAPIService,
    inforService: InforService,
    helpMessageService: HelpMessageService,
    scoreMessageService: ScoreMessageService,
    timetableMessageService: TimetableMessageService
  ) {
    this.sendAPIService = sendAPIService;
    this.inforService = inforService;
    this.helpMessageService = helpMessageService;
    this.scoreMessageService = scoreMessageService;
    this.timetableMessageService = timetableMessageService;
  }

  public async handleMessage(received_message: any) {
    const message = received_message.text;

    if (!message) {
      this.sendAPIService.call("What ???????");
      return;
    }

    const lowerMessage = message.toLowerCase();

    // Login
    if (lowerMessage.includes("login ")) {
      const mssvInput = message.slice(6, 6 + 8);
      const passInput = message.slice(6 + 8 + 1);

      if (!this.validateLoginInput(mssvInput, passInput)) {
        await this.sendAPIService.call("MSSV hoặc mật khẩu không hợp lệ");
        return;
      }

      this.inforService.set(mssvInput, passInput);

      await this.sendAPIService.call(
        "Đã ghi nhận thông tin của bạn. Nhớ thu hồi tin nhắn để người khác không đọc được nhé!"
      );
      await this.sendHelpButton();
      return;
    }

    // Logout
    if (lowerMessage === "logout") {
      this.inforService.delete();
      await this.sendAPIService.call("Thông tin của bạn đã được xoá");
      return;
    }

    // Check if user has logged in
    if (!this.isInforExisted()) {
      await this.sendAPIService.call(`Bạn vừa gửi: "${message}"`);
      await this.sendAPIService.call(`Bạn chưa đăng nhập!`);
      return;
    }

    await this.categorizeMessage(message);
  }

  private async categorizeMessage(message: string) {
    const lowerMessage = message.toLowerCase();

    const messageHandler: { [key: string]: any } = {
      "help": this.helpMessageService.handleHelp,
      "week": this.timetableMessageService.handleThisWeek,
      "week next": this.timetableMessageService.handleNextWeek,
      "score": this.scoreMessageService.handleByNameTable,
      "score overall": this.scoreMessageService.handleOverall,
      "score list": this.scoreMessageService.handleSemesterList,
    };
    if (lowerMessage in messageHandler) {
      await messageHandler[lowerMessage]();
      return;
    }

    // Weekday message
    const weekday: { [key: string]: any } = {
      mon: "Thứ 2",
      tue: "Thứ 3",
      wed: "Thứ 4",
      thu: "Thứ 5",
      fri: "Thứ 6",
      sat: "Thứ 7",
      sun: "CN",
      today: timezone.TODAY,
      tomorrow: timezone.TOMORROW,
    };
    if (lowerMessage in weekday) {
      await this.timetableMessageService.handleWeekday(weekday[lowerMessage]);
      return;
    }

    // Score with NameTable
    if (lowerMessage.includes("score- ")) {
      const nameTable = lowerMessage.slice(7);
      await this.scoreMessageService.handleByNameTable(nameTable);
      return;
    }

    // Wrong message
    await this.sendAPIService.call(`Bạn vừa gửi: "${message}"`);
    await this.sendHelpButton();
  }

  private validateLoginInput(mssvInput: string, passInput: string) {
    // MSSV must contain 8 characters
    if (mssvInput.length !== 8) return false;

    // Password must contain atleast 1 character
    if (passInput.length < 1) return false;

    // MSSV contains alphanumeric character only
    if (!/^[A-Za-z0-9]+$/.test(mssvInput)) return false;

    return true;
  }

  private isInforExisted() {
    const { mssv, pass } = this.inforService.get();
    if (!mssv || !pass) return false;
    return true;
  }

  private async sendHelpButton() {
    const text = `Nhắn "help" hoặc nhấn nút dưới đây để xem hướng dẫn!`;
    const buttons = [
      {
        type: "postback",
        title: "Help",
        payload: "Help",
      },
    ];
    await this.sendAPIService.callButtonTemplate(text, buttons);
  }

  public async handlePostback(received_postback: any) {
    const { payload } = received_postback;

    if (payload === "GET_STARTED") {
      this.sendAPIService.call(`Chào mừng bạn đến với chatbot của Đức Phạm 😎`);
      return;
    }

    // Check if user has logged in
    if (!this.isInforExisted()) {
      await this.sendAPIService.call(`Bạn vừa gửi: "${payload}"`);
      await this.sendAPIService.call(`Bạn chưa đăng nhập!`);
      return;
    }

    await this.categorizeMessage(payload);
  }
}
