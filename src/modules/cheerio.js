const cheerio = require("cheerio");

function cheerioSchedule(html) {
  const $ = cheerio.load(html);
  const subjectList = [];

  const table = $("#ThoiKhoaBieu1_tbTKBTheoTuan > tbody");
  table.find(".rowContent").each(function (i) {
    let start = i + 1; // start period from 1
    let dateIdx = 1;

    $(this)
      .find(".cell")
      .each(function () {
        dateIdx++;

        if (!$(this).attr("rowspan")) return; // skip td has no subject

        const periodLength = parseInt($(this).attr("rowspan")); // number of period

        const date = table.find(".Headerrow td:nth-child(" + dateIdx + ")").text();

        const text = $(this).text();
        const subjEndIdx = text.indexOf("|");
        const groupIdx = text.indexOf("Groups");
        const subGroupIdx = text.indexOf("Sub-group");
        const roomIdx = text.indexOf("Room");
        const noteIdx = text.indexOf("GV ");

        subjectList.push({
          date: (dateIdx === 8 ? "CN " : date.slice(0, 6)) + date.slice(-7, date.length),
          subject: text.slice(0, subjEndIdx),
          period: Array.from({ length: periodLength }, (ele, i) => i + start).join(","),
          group: text.slice(groupIdx + 8, groupIdx + 10).replace(/[^0-9a-z]/gi, ""),
          subGroup:
            subGroupIdx === -1
              ? "0"
              : text.slice(subGroupIdx + 11, subGroupIdx + 13).replace(/[^0-9a-z]/gi, ""),
          room: text
            .slice(roomIdx + 6)
            .replace("GV báo vắng", "")
            .replace(" GV dạy bù", ""),
          note: noteIdx === -1 ? "" : text.slice(noteIdx, text.length),
        });
      });
  });

  return subjectList.sort((a, b) => a.date.localeCompare(b.date));
}

function cheerioScheduleSemester($) {
  const scheduleSemester = [];

  $("#ThoiKhoaBieu1_cboHocKy")
    .find("option")
    .each(function () {
      scheduleSemester.push({
        text: $(this).text(),
        value: $(this).val(),
        isSelected: $(this).prop("selected"),
      });
    });

  return scheduleSemester;
}

module.exports = {
  cheerioSchedule,
  cheerioScheduleSemester,
};
