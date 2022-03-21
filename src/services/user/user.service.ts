import { injectable, inject } from "tsyringe";

@injectable()
export class UserService {
  private readonly sender_psid: string;

  constructor(@inject("sender_psid") sender_psid: string) {
    this.sender_psid = sender_psid;
  }

  public setData(mssv: string, pass: string) {
    process.env[this.sender_psid] = JSON.stringify({ mssv, pass });
  }

  public getData() {
    return process.env[this.sender_psid] ? JSON.parse(process.env[this.sender_psid] || "") : "";
  }

  public delete() {
    delete process.env[this.sender_psid];
  }
}
