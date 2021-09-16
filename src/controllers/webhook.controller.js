const request = require('request'); // for facebook
require('dotenv').config();

const Schedule = require('../modules/Schedule');
const Score = require('../modules/Score');

const {
  toScheduleMessage,
  toScoreMessage,
  toScoreAllMessage,
  toHelpMessage,
} = require('./utils/message.util');

class WebhookController {
  // [GET] ./webhook
  connect(req, res) {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }

  // [POST] ./webhook
  handle(req, res) {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function (entry) {
        // Gets the message. entry.messaging is an array, but
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('\nSender PSID: ' + sender_psid);

        // Check if the event is a message
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        }
      });

      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  }
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
  const message = received_message.text;
  console.log(`receive: "${message}"`);

  // Check if the message contains NO text
  if (!message) {
    callSendAPI(sender_psid, 'Like cái đầu * nhà bạn');
    return;
  }

  const lower = message.toLowerCase();
  const { mssv, pass } = getInfor(sender_psid);

  const MESSAGE_HANDLER = {
    'week': handleWeek,
    'week next': handleWeekNext,
    'score': handleScore,
    'score all': handleScoreAll,
    'help': handleHelp,
  };

  const DATE = {
    mon: 'Thứ 2',
    tue: 'Thứ 3',
    wed: 'Thứ 4',
    thu: 'Thứ 5',
    fri: 'Thứ 6',
    sat: 'Thứ 7',
    sun: 'CN',
    today: new Date().getDate(),
    tomorrow: new Date().getDate() + 1,
  };

  if (lower.includes('login ')) {
    callSendAPI(
      sender_psid,
      'Đã ghi nhận thông tin của bạn.\n' +
        'Nhớ xoá tin nhắn để bảo mật nhé!\n' +
        'Nhắn "help" (không quan trọng in hoa) để được hướng dẫn!'
    );

    saveInfor(
      sender_psid,
      message.slice(6, 6 + 8), // mssv
      message.slice(6 + 8 + 1) // pass
    );
  }
  // Check if user logged
  else if (mssv && pass) {
    // week - week next - score - score all - help
    if (lower in MESSAGE_HANDLER)
      MESSAGE_HANDLER[lower](sender_psid, mssv, pass);
    // weekday
    else if (lower in DATE) handleWeekday(sender_psid, mssv, pass, DATE[lower]);
    // score custom
    else if (lower.includes('score -'))
      handleScoreCustom(sender_psid, mssv, pass, message);
    else
      callSendAPI(
        sender_psid,
        `Bạn vừa gửi: "${message}"\n` + `Nhắn "help" để xem hướng dẫn nhé!`
      );
  }
  // Default reply
  else callSendAPI(sender_psid, `Bạn vừa gửi: "${message}"`);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, text) {
  // Construct the message body
  let request_body = {
    recipient: { id: sender_psid },
    message: { text },
  };

  return new Promise((resolve, reject) => {
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: request_body,
      },
      (err, res, body) => {
        if (!err) {
          console.log('message sent!');
          resolve();
        } else {
          console.error('Unable to send message:' + err);
          reject();
        }
      }
    );
  });
}

function saveInfor(sender_psid, mssv, pass) {
  process.env[sender_psid] = JSON.stringify({ mssv, pass });
}

function getInfor(sender_psid) {
  return process.env[sender_psid] ? JSON.parse(process.env[sender_psid]) : '';
}

// Send multiple splitted message if it is too long
async function sendMultiple(sender_psid, message, itemPerMessage = 8) {
  try {
    const numberOfMessage = Math.ceil(message.length / itemPerMessage);

    for (let i = 0; i < numberOfMessage; i++) {
      // Index of the first item in message
      const firstIdx = itemPerMessage * i;

      // Index of the last item in message
      const lastIdx = itemPerMessage * (i + 1);

      await callSendAPI(
        sender_psid,
        message.slice(firstIdx, lastIdx).join('\n')
      );
    }
  } catch (err) {
    console.error(err);
  }
}

// ===== HANDLE WEEK ===== //
async function handleWeek(sender_psid, mssv, pass) {
  callSendAPI(sender_psid, 'Đợi mình lấy TKB tuần này nhé!');

  const weekMessage = toScheduleMessage(await Schedule.getSchedule(mssv, pass));

  if (weekMessage) sendMultiple(sender_psid, weekMessage, 5);
  else callSendAPI(sender_psid, 'Tuần này không có lịch học');
}

// ===== HANDLE WEEK NEXT ===== //
async function handleWeekNext(sender_psid, mssv, pass) {
  callSendAPI(sender_psid, 'Đợi mình lấy TKB tuần sau nhé!');

  const weekNextMessage = toScheduleMessage(
    await Schedule.getSchedule(mssv, pass, true)
  );

  if (weekNextMessage) sendMultiple(sender_psid, weekNextMessage, 5);
  else callSendAPI(sender_psid, 'Tuần sau không có lịch học');
}

// ===== HANDLE SCORE ===== //
async function handleScore(sender_psid, mssv, pass) {
  const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS);
  const currentSemester = scoreOptions.find(
    (ele) => ele.NameTable == process.env.SEMESTER_SCORE
  );

  callSendAPI(
    sender_psid,
    `Đợi mình lấy điểm ${currentSemester.TenHocKy} nhé!`
  );

  const scoreMessage = toScoreMessage(await Score.getScore(mssv, pass));

  sendMultiple(sender_psid, scoreMessage);
}

// ===== HANDLE SCORE ALL ===== //
async function handleScoreAll(sender_psid, mssv, pass) {
  callSendAPI(sender_psid, 'Đợi mình lấy điểm tổng hợp nhé!');

  const scoreAllMessage = await toScoreAllMessage(
    await Score.getScoreAll(mssv, pass)
  );

  sendMultiple(sender_psid, scoreAllMessage);
}

// ===== HANDLE HELP ===== //
async function handleHelp(sender_psid, mssv, pass, message) {
  const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS);
  const helpMessage = toHelpMessage(scoreOptions);

  callSendAPI(sender_psid, helpMessage);
}

// ===== HANDLE WEEKDAY ===== //
async function handleWeekday(sender_psid, mssv, pass, date) {
  const notWeekday = {
    [new Date().getDate()]: 'Hôm nay',
    [new Date().getDate() + 1]: 'Ngày mai',
  };
  const dateText = date in notWeekday ? notWeekday[date] : date;

  callSendAPI(sender_psid, `Đợi mình lấy TKB ${dateText.toLowerCase()} nhé!`);

  const weekData = await Schedule.getSchedule(mssv, pass);
  const dateMessage = toScheduleMessage(
    weekData.filter((ele) => ele.date.includes(date))
  );

  if (dateMessage) callSendAPI(sender_psid, dateMessage.join('/n'));
  else {
    callSendAPI(sender_psid, `${dateText} không có lịch học`);
  }
}

// ===== HANDLE SCORE CUSTOM ===== //
async function handleScoreCustom(sender_psid, mssv, pass, message) {
  const semester = message.slice(7);
  const scoreOptions = JSON.parse(process.env.SCORE_OPTIONS);
  const currentSemester = scoreOptions.find((ele) => ele.NameTable == semester);

  if (!currentSemester) {
    callSendAPI(sender_psid, 'Bảng điểm không hợp lệ');
    return;
  }

  callSendAPI(
    sender_psid,
    `Đợi mình lấy điểm ${currentSemester.TenHocKy} nhé!`
  );

  const scoreMessage = toScoreMessage(
    await Score.getScore(mssv, pass, semester)
  );

  sendMultiple(sender_psid, scoreMessage);
}

module.exports = new WebhookController();
