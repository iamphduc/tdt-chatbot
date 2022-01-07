import { Request, Response } from "express";

import { MessageHandler } from "src/modules/MessageHandler";
import { saveInfor, getInfor, deleteInfor } from "src/utils/infor";
import { setUpPersistentMenu, callSendAPI } from "src/utils/facebookCall";
import timezone from "src/utils/timezone";

export class WebhookController {
  constructor() {
    this.connect = this.connect.bind(this);
    this.handle = this.handle.bind(this);
  }

  // [GET] /webhook
  connect(req: Request, res: Response) {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");

        // Set up persistent menu
        setUpPersistentMenu();

        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }

  // [POST] /webhook
  handle(req: Request, res: Response) {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === "page") {
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function (entry: any) {
        // Gets the message. entry.messaging is an array, but
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log("\nSender PSID: " + sender_psid);

        // Check if the event is a message
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
          // Check if the event is a postback
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });

      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED");
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  }
}

// Handles messages events
async function handleMessage(sender_psid: any, received_message: any) {
  const message = received_message.text;
  // console.log(`receive: "${message}"`);

  if (!message) return callSendAPI(sender_psid, { text: "What ???????" });

  const lower = message.toLowerCase();
  const { mssv, pass } = getInfor(sender_psid);

  if (lower.includes("login ")) {
    const mssvInput = message.slice(6, 6 + 8);
    const passInput = message.slice(6 + 8 + 1);

    if (!checkLoginInput(mssvInput, passInput))
      return callSendAPI(sender_psid, {
        text: "Thông tin của bạn không hợp lệ",
      });

    saveInfor(sender_psid, mssvInput, passInput);

    await callSendAPI(sender_psid, {
      text: "Đã ghi nhận thông tin của bạn. Nhớ thu hồi tin nhắn để bảo mật nhé!",
    });
    sendHelpButton(sender_psid);
  }

  // User logs out
  else if (lower == "logout") {
    deleteInfor(sender_psid);
    callSendAPI(sender_psid, { text: "Thông tin của bạn đã được xoá" });
  }

  // User logged in
  else if (mssv && pass) categorizeMessage(sender_psid, mssv, pass, message);
  else {
    await callSendAPI(sender_psid, { text: `Bạn vừa gửi: "${message}"` });
    callSendAPI(sender_psid, { text: `Bạn chưa đăng nhập!` });
  }
}

// Handles postback events
async function handlePostback(sender_psid: string, received_postback: any) {
  const payload = received_postback.payload;

  if (payload === "GET_STARTED")
    return callSendAPI(sender_psid, {
      text: `Chào mừng bạn đến với chatbot của Đức Phạm 😎`,
    });

  const { mssv, pass } = getInfor(sender_psid);

  // User logged in
  if (mssv && pass) categorizeMessage(sender_psid, mssv, pass, payload);
  else {
    await callSendAPI(sender_psid, { text: `Bạn vừa gửi: "${payload}"` });
    callSendAPI(sender_psid, { text: `Bạn chưa đăng nhập!` });
  }
}

// ====================================== //
// ========== SUPPORT FUNCTION ========== //

// Check if login input is valid
function checkLoginInput(mssvInput: string, passInput: string) {
  if (mssvInput.length < 8 || passInput.length < 1) return false;

  // MSSV contains alphanumeric character only
  if (!/^[A-Za-z0-9]+$/.test(mssvInput)) return false;

  return true;
}

// Reply to predefined messages if users have logged in
async function categorizeMessage(sender_psid: string, mssv: string, pass: string, message: string) {
  const lower = message.toLowerCase();

  const messageHandler = new MessageHandler();
  const MESSAGE_HANDLER: { [key: string]: any } = {
    "help": messageHandler.handleHelp,
    "week": messageHandler.handleWeek,
    "week next": messageHandler.handleWeekNext,
    "score": messageHandler.handleScore,
    "score all": messageHandler.handleScoreAll,
    "score list": messageHandler.handleScoreList,
  };

  if (lower in MESSAGE_HANDLER) return MESSAGE_HANDLER[lower](sender_psid, mssv, pass);

  const WEEKDAY: { [key: string]: any } = {
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

  if (lower in WEEKDAY)
    return messageHandler.handleWeekday(sender_psid, mssv, pass, WEEKDAY[lower]);

  if (lower.includes("score -"))
    return messageHandler.handleScoreCustom(sender_psid, mssv, pass, message);

  // default or wrong message
  await callSendAPI(sender_psid, { text: `Bạn vừa gửi: "${message}"` });
  sendHelpButton(sender_psid);
}

// Send custom Help message which have Help button
async function sendHelpButton(sender_psid: string) {
  await callSendAPI(sender_psid, {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: 'Nhắn "help" hoặc nhấn nút dưới đây để xem hướng dẫn!',
        buttons: [
          {
            type: "postback",
            title: "Help",
            payload: "Help",
          },
        ],
      },
    },
  });
}
