let rp = require('request-promise');
const cheerio = require('cheerio');

const School = require('./School');

const URL = {
  HOME: 'https://ketquahoctap.tdtu.edu.vn',
  SCORE: 'https://ketquahoctap.tdtu.edu.vn/Home/LayKetQuaHocTap',
  GPA: 'https://ketquahoctap.tdtu.edu.vn/Home/LayDTBHocKy',
  ALL: 'https://ketquahoctap.tdtu.edu.vn/Home/LayDiemTongHop',
  SEMESTER: 'https://ketquahoctap.tdtu.edu.vn/Home/LayHocKy_KetQuaHocTap',
};

class Score extends School {
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

  // ===== GET SCORE DATA ===== //
  async getScoreData() {
    try {
      console.time('Score home');
      const scoreHome = await rp({
        uri: URL.HOME,
      });
      console.timeEnd('Score home');

      // cheerio
      const $ = cheerio.load(scoreHome);
      const data = {
        lop: $('#lop').text(),
        hedaotao: $('#hedaotao').text(),
        namvt: $('#namvt').text(),
      };

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  // ===== SCORE + GPA ===== //
  async getScore(mssv, pass, semester = process.env.SEMESTER_SCORE) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return 'Login failed';

      const { lop, hedaotao } = await this.getScoreData();

      // request score
      console.time('Score');
      const score = await rp({
        uri: URL.SCORE,
        qs: { mssv, nametable: semester, hedaotao, time: Date.now() },
        json: true,
      });
      console.timeEnd('Score');

      // request gpa
      console.time('GPA');
      const GPA = await rp({
        uri: URL.GPA,
        qs: { lop, mssv, tenBangDiem: semester, time: Date.now() },
        json: true,
      });
      console.timeEnd('GPA');

      score.push(GPA);

      return score;
    } catch (error) {
      console.log(error);
    }
  }

  // ===== SCORE ALL ===== //
  async getScoreAll(mssv, pass) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return 'Login failed';

      const { hedaotao, namvt } = await this.getScoreData();

      // request score total
      console.time('Score total');
      const scoreTotal = await rp({
        uri: URL.ALL,
        qs: { mssv, namvt, hedaotao, time: Date.now() },
        json: true,
      });
      console.timeEnd('Score total');

      return scoreTotal;
    } catch (error) {
      console.log(error);
    }
  }

  // ===== SCORE SEMESTER ===== //
  async getScoreSemester(mssv, pass) {
    try {
      const loginResult = await super.login(mssv, pass);
      if (!loginResult) return 'Login failed';

      const { hedaotao, namvt } = await this.getScoreData();

      // request score semester
      console.time('Score semester');
      const scoreSemester = await rp({
        uri: URL.SEMESTER,
        qs: { mssv, namvt, hedaotao, time: Date.now() },
        json: true,
      });
      console.timeEnd('Score semester');

      // globalize for webhook score message
      process.env.SCORE_OPTIONS = JSON.stringify(scoreSemester);

      return scoreSemester;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new Score();
