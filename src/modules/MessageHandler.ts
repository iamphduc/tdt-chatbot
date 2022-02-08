/* eslint-disable @typescript-eslint/no-use-before-define */
import { Schedule } from "./Schedule";
import { Score } from "./Score";

import { callSendAPI, callMultipleSendAPI } from "src/utils/facebookCall";
import { createQuickReplies, createScoreListElements } from "src/utils/postback";
import {
  toScheduleMessage,
  toScoreMessage,
  toScoreAllMessage,
  toHelpMessage,
} from "src/utils/message";
import timezone from "src/utils/timezone";

export class MessageHandler {
  readonly Schedule: Schedule;
  readonly Score: Score;

  constructor() {
    this.Schedule = new Schedule();
    this.Score = new Score();
  }

  async handleHelp(sender_psid: string, mssv: string, pass: string) {
    try {
      const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS || "");
      const helpMessage = toHelpMessage(scoreOptions);

      callSendAPI(sender_psid, {
        text: helpMessage,
        quick_replies: createQuickReplies([
          "week",
          "week next",
          "today",
          "tomorrow",
          "score",
          "score all",
          "score list",
          `score -${process.env.SEMESTER_SCORE}`,
        ]),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async handleWeek(sender_psid: string, mssv: string, pass: string) {
    try {
      callSendAPI(sender_psid, { text: "Đợi mình lấy TKB tuần này nhé!" });

      const data = await this.Schedule.getSchedule(mssv, pass);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const weekMessage = toScheduleMessage(data);
      if (weekMessage) callMultipleSendAPI(sender_psid, weekMessage, 5);
      else callSendAPI(sender_psid, { text: "Tuần này không có lịch học" });
    } catch (error) {
      console.log(error);
    }
  }

  async handleWeekNext(sender_psid: string, mssv: string, pass: string) {
    try {
      callSendAPI(sender_psid, { text: "Đợi mình lấy TKB tuần sau nhé!" });

      const data = await this.Schedule.getSchedule(mssv, pass, true);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const weekNextMessage = toScheduleMessage(data);
      if (weekNextMessage) callMultipleSendAPI(sender_psid, weekNextMessage, 5);
      else callSendAPI(sender_psid, { text: "Tuần sau không có lịch học" });
    } catch (error) {
      console.log(error);
    }
  }

  async handleWeekday(sender_psid: string, mssv: string, pass: string, date: any) {
    try {
      const notWeekday = {
        [timezone.TODAY]: "Hôm nay",
        [timezone.TOMORROW]: "Ngày mai",
      };
      const dateText = date in notWeekday ? notWeekday[date] : date;

      callSendAPI(sender_psid, {
        text: `Đợi mình lấy TKB ${dateText == "CN" ? dateText : dateText.toLowerCase()} nhé!`,
      });

      const data = await this.Schedule.getSchedule(mssv, pass);
      if (!isLoginSuccessful(sender_psid, data)) return;

      if (Array.isArray(data)) {
        const dateMessage = toScheduleMessage(data.filter((ele: any) => ele.date.includes(date)));
        if (dateMessage) callSendAPI(sender_psid, { text: dateMessage.join("\n") });
        else callSendAPI(sender_psid, { text: `${dateText} không có lịch học` });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async handleScore(sender_psid: string, mssv: string, pass: string) {
    try {
      const semesterName = findScoreSemesterName(sender_psid, process.env.SEMESTER_SCORE);

      callSendAPI(sender_psid, {
        text: `Đợi mình lấy điểm ${semesterName} nhé!`,
      });

      const data = await this.Score.getScore(mssv, pass);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const scoreMessage = toScoreMessage(data);
      if (scoreMessage) callMultipleSendAPI(sender_psid, scoreMessage);
      else
        callSendAPI(sender_psid, {
          text: `Không tìm thấy bảng điểm ${semesterName}`,
        });
    } catch (error) {
      console.log(error);
    }
  }

  async handleScoreAll(sender_psid: string, mssv: string, pass: string) {
    try {
      callSendAPI(sender_psid, { text: "Đợi mình lấy điểm tổng hợp nhé!" });

      const data = await this.Score.getScoreAll(mssv, pass);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const scoreAllMessage = await toScoreAllMessage(data);
      if (scoreAllMessage) callMultipleSendAPI(sender_psid, scoreAllMessage);
      else callSendAPI(sender_psid, { text: `Không tìm thấy bảng điểm tổng hợp` });
    } catch (error) {
      console.log(error);
    }
  }

  async handleScoreList(sender_psid: string, mssv?: string, pass?: string) {
    try {
      const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS || "").reverse();

      await callSendAPI(sender_psid, {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: createScoreListElements(scoreOptions),
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async handleScoreCustom(sender_psid: string, mssv: string, pass: string, message: any) {
    try {
      const semester = message.slice(7);
      const semesterName = findScoreSemesterName(sender_psid, semester);
      if (!semesterName) return;

      callSendAPI(sender_psid, {
        text: `Đợi mình lấy điểm ${semesterName} nhé!`,
      });

      const data = await this.Score.getScore(mssv, pass, semester);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const scoreMessage = toScoreMessage(data);
      if (scoreMessage) callMultipleSendAPI(sender_psid, scoreMessage);
      else
        callSendAPI(sender_psid, {
          text: `Không tìm thấy bảng điểm ${semesterName}`,
        });
    } catch (error) {
      console.log(error);
    }
  }
}

// Check if login was successfull
function isLoginSuccessful(sender_psid: string, data: any) {
  if (data != "Login failed") return true;

  callSendAPI(sender_psid, { text: `Không thể đăng nhập vào cổng sinh viên` });
  return false;
}

// Get TenHocKy from NameTable
function findScoreSemesterName(sender_psid: string, semester: any) {
  const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS || "");
  const foundSemester = scoreOptions.find((ele: any) => ele.NameTable == semester);

  // Check if invalid NameTable for score custom
  if (!foundSemester) {
    callSendAPI(sender_psid, {
      text: "Bảng điểm không hợp lệ",
      quick_replies: createQuickReplies(scoreOptions.map((ele: any) => `score -${ele.NameTable}`)),
    });

    return false;
  }

  return foundSemester.TenHocKy;
}
