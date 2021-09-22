let rp = require('request-promise');
const cheerio = require('cheerio');

const School = require('./School');

const URL = {
  home: 'https://ketquahoctap.tdtu.edu.vn',
  score: 'https://ketquahoctap.tdtu.edu.vn/Home/LayKetQuaHocTap',
  gpa: 'https://ketquahoctap.tdtu.edu.vn/Home/LayDTBHocKy',
  all: 'https://ketquahoctap.tdtu.edu.vn/Home/LayDiemTongHop',
  semester: 'https://ketquahoctap.tdtu.edu.vn/Home/LayHocKy_KetQuaHocTap',
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

  // ===== GOTO SCORE PAGE ===== //
  async goToScorePage() {
    try {
      console.time('Score home');
      const scoreHome = await rp({
        uri: URL.home,
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

      const { lop, hedaotao } = await this.goToScorePage();

      // request score
      console.time('Score');
      const score = await rp({
        uri: URL.score,
        qs: { mssv, nametable: semester, hedaotao, time: Date.now() },
        json: true,
      });
      console.timeEnd('Score');

      // request gpa
      console.time('GPA');
      const GPA = await rp({
        uri: URL.gpa,
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

      const { hedaotao, namvt } = await this.goToScorePage();

      // request score total
      console.time('Score total');
      const scoreTotal = await rp({
        uri: URL.all,
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

      const { hedaotao, namvt } = await this.goToScorePage();

      // request score semester
      console.time('Score semester');
      const scoreSemester = await rp({
        uri: URL.semester,
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
