import axios, { AxiosInstance } from "axios";

interface Response {
  text: string;
}

export class SendAPIService {
  private readonly URL: string = "https://graph.facebook.com/v2.6/me/messages";
  private readonly sender_psid: string;
  private readonly client: AxiosInstance;

  constructor(sender_psid: string) {
    this.sender_psid = sender_psid;
    this.client = axios.create({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      },
    });
  }

  public async call(message: string | Response) {
    // Doc: https://developers.facebook.com/docs/messenger-platform/reference/send-api/

    let response = message;
    if (typeof message === "string") {
      response = { text: message };
    }

    const requestBody = {
      recipient: { id: this.sender_psid },
      message: response,
    };

    await this.client({
      method: "POST",
      url: this.URL,
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
      data: requestBody,
    });
  }

  // In case a message is too long, split message into multiple responses
  public async callMultiple(messageArr: string[], messagePerResponse = 8) {
    const numberOfResponse = Math.ceil(messageArr.length / messagePerResponse);

    const responses: Response[] = [];
    for (let i = 0; i < numberOfResponse; i += 1) {
      const message = messageArr.slice(i * messagePerResponse, (i + 1) * messagePerResponse);
      responses.push({
        text: message.join("\n"),
      });
    }

    // eslint-disable-next-line no-restricted-syntax
    for await (const response of responses) {
      this.call(response);
    }
  }

  public async callGenericTemplate(elements: any[]) {
    // Doc: https://developers.facebook.com/docs/messenger-platform/send-messages/template/generic

    const requestBody = {
      recipient: { id: this.sender_psid },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements,
          },
        },
      },
    };

    await this.client({
      method: "POST",
      url: this.URL,
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
      data: requestBody,
    });
  }

  public async callButtonTemplate(text: string, buttons: any[]) {
    // Doc: https://developers.facebook.com/docs/messenger-platform/send-messages/template/button

    const requestBody = {
      recipient: { id: this.sender_psid },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text,
            buttons,
          },
        },
      },
    };

    await this.client({
      method: "POST",
      url: this.URL,
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
      data: requestBody,
    });
  }

  public async callQuickReplies(text: string, quickReplies: any[]) {
    // Doc: https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies

    const requestBody = {
      recipient: { id: this.sender_psid },
      message: {
        text,
        quick_replies: quickReplies,
      },
    };

    await this.client({
      method: "POST",
      url: this.URL,
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
      data: requestBody,
    });
  }
}
