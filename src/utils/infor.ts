export function saveInfor(sender_psid: string, mssv: string, pass: string) {
  process.env[sender_psid] = JSON.stringify({ mssv, pass });
}

export function getInfor(sender_psid: string) {
  return process.env[sender_psid] ? JSON.parse(process.env[sender_psid] || "") : "";
}

export function deleteInfor(sender_psid: string) {
  delete process.env[sender_psid];
}
