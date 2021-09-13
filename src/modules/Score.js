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
  async goToScorePage(semester = process.env.SCORE) {
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
    } catch (err) {
      console.log('Score - goToScorePage error: ' + err);
      return err;
    }
  }

  // ===== SCORE + GPA ===== //
  async getScore(mssv, pass, semester = 110) {
    try {
      await super.login(mssv, pass);
      const { lop, hedaotao } = await this.goToScorePage();

      // request score
      console.time('Score');
      const score = await rp({
        uri: URL.score,
        qs: {
          mssv,
          nametable: semester,
          hedaotao,
          time: Date.now(),
        },
        json: true,
      });
      console.timeEnd('Score');

      // request gpa
      console.time('GPA');
      const GPA = await rp({
        uri: URL.gpa,
        qs: {
          lop,
          mssv,
          tenBangDiem: semester,
          time: Date.now(),
        },
        json: true,
      });
      console.timeEnd('GPA');

      score.push(GPA);

      return score;
    } catch (err) {
      console.log('Score - getScore error: ' + err);
      return err;
    }
  }

  // ===== SCORE TOTAL ===== //
  async getScoreAll(mssv, pass) {
    try {
      await this.login(mssv, pass);
      const { hedaotao, namvt } = await this.goToScorePage();

      // request score total
      console.time('Score total');
      const scoreTotal = await rp({
        uri: URL.all,
        qs: {
          mssv,
          namvt,
          hedaotao,
          time: Date.now(),
        },
        json: true,
      });
      console.timeEnd('Score total');

      return scoreTotal;
    } catch (err) {
      console.log('Score - getScoreTotal error: ' + err);
      return err;
    }
  }

  // ===== SCORE SEMESTER ===== //
  async getScoreSemester(mssv, pass) {
    try {
      await this.login(mssv, pass);
      const { hedaotao, namvt } = await this.goToScorePage();

      // request score semester
      console.time('Score semester');
      const scoreSemester = await rp({
        uri: URL.semester,
        qs: {
          mssv,
          namvt,
          hedaotao,
          time: Date.now(),
        },
        json: true,
      });
      console.timeEnd('Score semester');

      return scoreSemester;
    } catch (err) {
      console.log('Score - getScoreSemester error: ' + err);
      return err;
    }
  }
}

module.exports = new Score();
