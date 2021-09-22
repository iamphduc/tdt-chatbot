function saveInfor(sender_psid, mssv, pass) {
  process.env[sender_psid] = JSON.stringify({ mssv, pass });
}

function getInfor(sender_psid) {
  return process.env[sender_psid] ? JSON.parse(process.env[sender_psid]) : '';
}

function deleteInfor(sender_psid) {
  delete process.env[sender_psid];
}

module.exports = { saveInfor, getInfor, deleteInfor };
