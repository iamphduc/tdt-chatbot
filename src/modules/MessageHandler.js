const Schedule = require('./Schedule');
const Score = require('./Score');

const { callSendAPI, callMultipleSendAPI } = require('../utils/facebookCall');
const {
  createQuickReplies,
  createScoreListElements,
} = require('../utils/postback');
const {
  toScheduleMessage,
  toScoreMessage,
  toScoreAllMessage,
  toHelpMessage,
} = require('../utils/message');
const timezone = require('../utils/timezone');

class MessageHandler {
  async handleHelp(sender_psid, mssv, pass) {
    try {
      const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS);
      const helpMessage = toHelpMessage(scoreOptions);

      callSendAPI(sender_psid, {
        text: helpMessage,
        quick_replies: createQuickReplies([
          'week',
          'week next',
          'today',
          'tomorrow',
          'score',
          'score all',
          'score list',
          `score -${process.env.SEMESTER_SCORE}`,
        ]),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async handleWeek(sender_psid, mssv, pass) {
    try {
      callSendAPI(sender_psid, { text: 'Đợi mình lấy TKB tuần này nhé!' });

      const data = await Schedule.getSchedule(mssv, pass);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const weekMessage = toScheduleMessage(data);
      if (weekMessage) callMultipleSendAPI(sender_psid, weekMessage, 5);
      else callSendAPI(sender_psid, { text: 'Tuần này không có lịch học' });
    } catch (error) {
      console.log(error);
    }
  }

  async handleWeekNext(sender_psid, mssv, pass) {
    try {
      callSendAPI(sender_psid, { text: 'Đợi mình lấy TKB tuần sau nhé!' });

      const data = await Schedule.getSchedule(mssv, pass, true);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const weekNextMessage = toScheduleMessage(data);
      if (weekNextMessage) callMultipleSendAPI(sender_psid, weekNextMessage, 5);
      else callSendAPI(sender_psid, { text: 'Tuần sau không có lịch học' });
    } catch (error) {
      console.log(error);
    }
  }

  async handleWeekday(sender_psid, mssv, pass, date) {
    try {
      const notWeekday = {
        [timezone.TODAY]: 'Hôm nay',
        [timezone.TOMORROW]: 'Ngày mai',
      };
      const dateText = date in notWeekday ? notWeekday[date] : date;

      callSendAPI(sender_psid, {
        text: `Đợi mình lấy TKB ${
          dateText == 'CN' ? dateText : dateText.toLowerCase()
        } nhé!`,
      });

      const data = await Schedule.getSchedule(mssv, pass);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const dateMessage = toScheduleMessage(
        data.filter((ele) => ele.date.includes(date))
      );
      if (dateMessage)
        callSendAPI(sender_psid, { text: dateMessage.join('\n') });
      else callSendAPI(sender_psid, { text: `${dateText} không có lịch học` });
    } catch (error) {
      console.log(error);
    }
  }

  async handleScore(sender_psid, mssv, pass) {
    try {
      const semesterName = findScoreSemesterName(
        sender_psid,
        process.env.SEMESTER_SCORE
      );

      callSendAPI(sender_psid, {
        text: `Đợi mình lấy điểm ${semesterName} nhé!`,
      });

      const data = await Score.getScore(mssv, pass);
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

  async handleScoreAll(sender_psid, mssv, pass) {
    try {
      callSendAPI(sender_psid, { text: 'Đợi mình lấy điểm tổng hợp nhé!' });

      const data = await Score.getScoreAll(mssv, pass);
      if (!isLoginSuccessful(sender_psid, data)) return;

      const scoreAllMessage = await toScoreAllMessage(data);
      if (scoreAllMessage) callMultipleSendAPI(sender_psid, scoreAllMessage);
      else
        callSendAPI(sender_psid, { text: `Không tìm thấy bảng điểm tổng hợp` });
    } catch (error) {
      console.log(error);
    }
  }

  async handleScoreList(sender_psid, mssv, pass) {
    try {
      const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS).reverse();

      await callSendAPI(sender_psid, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: createScoreListElements(scoreOptions),
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async handleScoreCustom(sender_psid, mssv, pass, message) {
    try {
      const semester = message.slice(7);
      const semesterName = findScoreSemesterName(sender_psid, semester);
      if (!semesterName) return;

      callSendAPI(sender_psid, {
        text: `Đợi mình lấy điểm ${semesterName} nhé!`,
      });

      const data = await Score.getScore(mssv, pass, semester);
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
function isLoginSuccessful(sender_psid, data) {
  if (data != 'Login failed') return true;

  callSendAPI(sender_psid, { text: `Không thể đăng nhập vào cổng sinh viên` });
  return false;
}

// Get TenHocKy from NameTable
function findScoreSemesterName(sender_psid, semester) {
  const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS);
  const foundSemester = scoreOptions.find((ele) => ele.NameTable == semester);

  // Check if invalid NameTable for score custom
  if (!foundSemester) {
    callSendAPI(sender_psid, {
      text: 'Bảng điểm không hợp lệ',
      quick_replies: createQuickReplies(
        scoreOptions.map((ele) => `score -${ele.NameTable}`)
      ),
    });

    return false;
  }

  return foundSemester.TenHocKy;
}

module.exports = new MessageHandler();
