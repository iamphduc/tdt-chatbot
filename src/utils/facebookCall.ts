/* eslint-disable @typescript-eslint/naming-convention */
import request from "request";

export function setUpPersistentMenu() {
  const menu_body = {
    get_started: { payload: "GET_STARTED" },
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: [
          {
            title: "TKB tuần này",
            type: "postback",
            payload: "week",
          },
          {
            title: "TKB tuần sau",
            type: "postback",
            payload: "week next",
          },
          {
            title: "TKB hôm nay",
            type: "postback",
            payload: "today",
          },
          {
            title: "TKB ngày mai",
            type: "postback",
            payload: "tomorrow",
          },
          {
            title: "Danh sách điểm học kỳ",
            type: "postback",
            payload: "score list",
          },
          {
            title: "Điểm tổng hợp",
            type: "postback",
            payload: "score all",
          },
        ],
      },
    ],
  };

  return new Promise((resolve, reject) => {
    request(
      {
        url: "https://graph.facebook.com/v12.0/me/messenger_profile",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: menu_body,
      },
      (err: any, res: any, body: any) => {
        if (!err) {
          console.log("Set up persistent menu!");
          resolve(true);
        } else {
          console.error("Unable to send message:" + err);
          reject(false);
        }
      }
    );
  });
}

// Send response messages via the Send API
export function callSendAPI(sender_psid: any, response: any) {
  // Construct the message body
  const request_body = {
    recipient: { id: sender_psid },
    message: response,
  };

  return new Promise((resolve, reject) => {
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body,
      },
      (err: any, res: any, body: any) => {
        if (!err) {
          console.log("Message sent!");
          resolve(true);
        } else {
          console.error("Unable to send message:" + err);
          reject(false);
        }
      }
    );
  });
}

// Split message if it is too long
export async function callMultipleSendAPI(sender_psid: any, message: any, itemPerMessage = 8) {
  try {
    const numberOfMessage = Math.ceil(message.length / itemPerMessage);

    for (let i = 0; i < numberOfMessage; i++) {
      // Index of the first item in message
      const firstIdx = itemPerMessage * i;

      // Index of the last item in message
      const lastIdx = itemPerMessage * (i + 1);

      await callSendAPI(sender_psid, {
        text: message.slice(firstIdx, lastIdx).join("\n"),
      });
    }
  } catch (err) {
    console.error(err);
  }
}
