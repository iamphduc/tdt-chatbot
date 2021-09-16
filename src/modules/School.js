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
      console.log('========== REQUEST ==========');

      console.time('Login');
      const { url } = await rp({
        method: 'POST',
        uri: URL,
        formData: { user, pass },
        json: true,
      });
      console.timeEnd('Login');

      // setting cookie manually is faster than authentication cookie
      const token = url.slice(url.indexOf('Token=') + 6);
      setAuthCookie(this.jar, token);
    } catch (err) {
      console.log('School - login error:' + err);
      return err;
    }
  }
}

function setAuthCookie(jar, token) {
  const date = new Date(
    86400000 + 1000 * 60 * 30 + +new Date()
  ).toLocaleString();

  jar.setCookie(
    'AUTH_COOKIE=' + token + '|' + date + '; path=/',
    'http://sso.tdt.edu.vn/Authenticate.aspx'
  );
}

module.exports = School;
