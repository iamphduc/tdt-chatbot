import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

import { TDTU_URL } from "@configs/url";
import { getter, setter } from "@decorators/getter-setter";

export interface SchoolScraperService {
  getMssv: () => string;
  setMssv: (mssv: string) => void;
  getPass: () => string;
  setPass: (pass: string) => void;
}

export class SchoolScraperService {
  @getter
  @setter
  protected readonly mssv: string;

  @getter
  @setter
  protected readonly pass: string;

  protected readonly client: AxiosInstance;

  constructor(mssv?: string, pass?: string) {
    this.mssv = mssv ?? "";
    this.pass = pass ?? "";

    this.client = wrapper(
      axios.create({
        jar: new CookieJar(),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        },
      })
    );
  }

  protected async login() {
    // Similar to FormData
    const loginData = new URLSearchParams({
      user: this.mssv,
      pass: this.pass,
    });

    const { data } = await this.client({
      method: "POST",
      url: TDTU_URL.login,
      data: loginData,
    });

    await this.authenticate(data.url);
  }

  private async authenticate(url: string) {
    await this.client({
      method: "GET",
      url,
    });
  }
}
