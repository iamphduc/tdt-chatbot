let rp = require('request-promise');

const URL = 'https://stdportal.tdtu.edu.vn/Login/SignIn';

class School {
  constructor() {
    this.jar = rp.jar();

    rp = rp.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
      },
      jar: this.jar,
    });
  }

  async login(user, pass) {
    try {
      console.log('\n========== REQUEST ==========');

      console.time('Login');
      const { url } = await rp({
        method: 'POST',
        uri: URL,
        form: {
          user,
          pass,
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
          Connection: 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        json: true,
      });
      console.timeEnd('Login');

      // setting cookie manually is faster than authentication cookie
      const token = url.slice(url.indexOf('Token=') + 6);
      const date = new Date(
        86400000 + 1000 * 60 * 30 + +new Date()
      ).toLocaleString();

      this.jar.setCookie(
        'AUTH_COOKIE=' + token + '|' + date + '; path=/',
        'http://sso.tdt.edu.vn/Authenticate.aspx'
      );
    } catch (err) {
      console.log('School - login error:' + err);
      return err;
    }
  }
}

module.exports = School;
