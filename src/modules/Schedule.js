let rp = require('request-promise');
const cheerio = require('cheerio');

const School = require('./School');

const URL = 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx';

class Schedule extends School {
  constructor() {
    super();

    rp = rp.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
      },
      jar: this.jar,
    });
  }

  // ===== GET SCHEDULE DATA ===== //
  async getScheduleData(noData = false) {
    try {
      console.time('Schedule page');
      const schedulePage = await rp({
        uri: URL,
        resolveWithFullResponse: true,
      });
      console.timeEnd('Schedule page');

      // cheerio
      const $ = cheerio.load(schedulePage.body);

      // for schedule semester
      if (noData) return $;

      const data = {
        search: schedulePage.request.uri.search,
        __EVENTTARGET: $('#__EVENTTARGET').val(),
        __EVENTARGUMENT: $('#__EVENTARGUMENT').val(),
        __LASTFOCUS: $('#__LASTFOCUS').val(),
        __VIEWSTATE: $('#__VIEWSTATE').val(),
        __VIEWSTATEGENERATOR: $('#__VIEWSTATEGENERATOR').val(),
      };

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  // ===== CHANGE SCHEDULE ===== //
  async changeSchedule(data, next = false) {
    try {
      const { search, ...others } = data;

      const formData = {
        ...others,
        ThoiKhoaBieu1$cboHocKy: process.env.SEMESTER_SCHEDULE,
        ThoiKhoaBieu1$radChonLua: 'radXemTKBTheoTuan',
      };

      if (next)
        formData['ThoiKhoaBieu1$btnTuanSau'] = 'Tuần sau|Following week >>';
      else formData['ThoiKhoaBieu1$btnTuanHienTai'] = '';

      console.time('Change schedule');
      await rp({
        method: 'POST',
        uri: URL + search,
        formData,
        simple: false,
      });
      console.timeEnd('Change schedule');
    } catch (error) {
      console.log(error);
    }
  }

  // ===== GET SCHEDULE ===== //
  async getSchedule(mssv, pass, next = false) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return 'Login failed';

      const data = await this.getScheduleData();
      await this.changeSchedule(data);

      // CURRENT SCHEDULE
      console.time('Current schedule');
      const currentSchedule = await rp({
        uri: URL,
      });
      console.timeEnd('Current schedule');

      if (!next) return cheerioSchedule(currentSchedule);

      // NEXT SCHEDULE
      console.time('Next schedule');
      await this.changeSchedule(data, true); // next = true
      const nextSchedule = await rp({
        uri: URL,
      });
      console.timeEnd('Next schedule');

      return cheerioSchedule(nextSchedule);
    } catch (error) {
      console.log(error);
    }
  }

  async getScheduleSemester(mssv, pass) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return 'Login failed';

      const $ = await this.getScheduleData(true);

      const scheduleSemester = [];
      $('#ThoiKhoaBieu1_cboHocKy')
        .find('option')
        .each(function () {
          scheduleSemester.push({
            text: $(this).text(),
            value: $(this).val(),
            isSelected: $(this).prop('selected'),
          });
        });

      return scheduleSemester;
    } catch (error) {
      console.log(error);
    }
  }
}

function cheerioSchedule(html) {
  const $ = cheerio.load(html);
  const subjectList = [];

  const table = $('#ThoiKhoaBieu1_tbTKBTheoTuan > tbody');
  table.find('.rowContent').each(function (i) {
    let start = i + 1; // start period from 1
    let dateIdx = 1;

    $(this)
      .find('.cell')
      .each(function () {
        dateIdx++;

        if (!$(this).attr('rowspan')) return; // skip td has no subject

        const periodLength = parseInt($(this).attr('rowspan')); // number of period

        const date = table
          .find('.Headerrow td:nth-child(' + dateIdx + ')')
          .text();

        const text = $(this).text();
        const subjEndIdx = text.indexOf('|');
        const groupIdx = text.indexOf('Groups');
        const subGroupIdx = text.indexOf('Sub-group');
        const roomIdx = text.indexOf('Room');
        const noteIdx = text.indexOf('GV ');

        subjectList.push({
          date:
            (dateIdx === 8 ? 'CN ' : date.slice(0, 6)) +
            date.slice(-7, date.length),
          subject: text.slice(0, subjEndIdx),
          period: Array.from(
            { length: periodLength },
            (ele, i) => i + start
          ).join(','),
          group: text
            .slice(groupIdx + 8, groupIdx + 10)
            .replace(/[^0-9a-z]/gi, ''),
          subGroup:
            subGroupIdx === -1
              ? '0'
              : text
                  .slice(subGroupIdx + 11, subGroupIdx + 13)
                  .replace(/[^0-9a-z]/gi, ''),
          room: text
            .slice(roomIdx + 6)
            .replace('GV báo vắng', '')
            .replace(' GV dạy bù', ''),
          note: noteIdx === -1 ? '' : text.slice(noteIdx, text.length),
        });
      });
  });

  return subjectList.sort((a, b) => a.date.localeCompare(b.date));
}

module.exports = new Schedule();
