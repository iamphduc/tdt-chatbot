import axios, { AxiosInstance } from "axios";
import logger from "../../utils/logger";

// Doc : https://developers.facebook.com/docs/messenger-platform/send-messages/persistent-menu

export class PersistentMenuService {
  private readonly URL: string = "https://graph.facebook.com/v12.0/me/messenger_profile";
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      },
    });
  }

  private async createMenuBody() {
    const actions = [
      {
        title: "Lịch học tuần này",
        type: "postback",
        payload: "week",
      },
      {
        title: "Lịch học tuần sau",
        type: "postback",
        payload: "week next",
      },
      {
        title: "Lịch học hôm nay",
        type: "postback",
        payload: "today",
      },
      {
        title: "Lịch học ngày mai",
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
        payload: "score overall",
      },
    ];

    const menuBody = {
      get_started: {
        payload: "GET_STARTED",
      },
      persistent_menu: [
        {
          locale: "default",
          composer_input_disabled: false,
          call_to_actions: actions,
        },
      ],
    };

    return menuBody;
  }

  public async call() {
    const menuBody = await this.createMenuBody();

    await this.client({
      method: "POST",
      url: this.URL,
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
      data: menuBody,
    }).then(() => {
      logger.info("Set up persistent menu!");
    });
  }
}
