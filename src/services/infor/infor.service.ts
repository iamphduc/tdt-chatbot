export class InforService {
  private readonly sender_psid: string;

  constructor(sender_psid: string) {
    this.sender_psid = sender_psid;
  }

  public set(mssv: string, pass: string) {
    process.env[this.sender_psid] = JSON.stringify({ mssv, pass });
  }

  public get() {
    return process.env[this.sender_psid] ? JSON.parse(process.env[this.sender_psid] || "") : "";
  }

  public delete() {
    delete process.env[this.sender_psid];
  }
}
