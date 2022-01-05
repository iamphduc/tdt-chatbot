let rp = require('request-promise');

const LOGIN_URL = 'https://stdportal.tdtu.edu.vn/Login/SignIn';

class School {
  jar: any;

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

  async login(user: string, pass: string): Promise<boolean> {
    try {
      console.log('========== REQUEST ==========');

      console.time('Login');
      const { url, result } = await rp({
        method: 'POST',
        uri: URL,
        formData: { user, pass },
        json: true,
      });
      console.timeEnd('Login');
      console.log(result);
      if (result == 'fail') return false;

      // set cookie manually is much faster than redirect authentication
      const token = url.slice(url.indexOf('Token=') + 6);
      setAuthCookie(this.jar, token);

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

function setAuthCookie(jar: any, token: string): void {
  const date = new Date(
    86400000 + 1000 * 60 * 30 + +new Date()
  ).toLocaleString();

  jar.setCookie(
    'AUTH_COOKIE=' + token + '|' + date + '; path=/',
    'http://sso.tdt.edu.vn/Authenticate.aspx'
  );
}

module.exports = School;
