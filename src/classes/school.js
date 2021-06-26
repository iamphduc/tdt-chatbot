
let rp = require('request-promise');
const cheerio = require('cheerio');


class School {

    constructor() {
        this.jar = rp.jar();

        rp = rp.defaults({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
            },
            jar: this.jar,
        })
    }

    async login(mssv, pass) {
        try {
            console.time("\n========== REQUEST ==========\nLogin");
    
            const responseLogin = await rp({
                method: 'POST',
                uri: 'https://stdportal.tdtu.edu.vn/Login/SignIn?ReturnURL=https://stdportal.tdtu.edu.vn/',
                form: {
                    user: mssv,
                    pass: pass,
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                json: true,
            });

            const AUTHTOKEN = responseLogin.url.slice(-8);
            setAuthCookie(this.jar, AUTHTOKEN);
            
            console.timeEnd("\n========== REQUEST ==========\nLogin");

        } catch (err) {
            return err;
        }
    }

    async getSchedule(mssv, pass, next=false) {
        try {
            await this.login(mssv, pass);

    
            // ===== SCHEDULE ===== //
    
            console.time("Schedule");
    
            const schedule = await rp({
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
                resolveWithFullResponse: true,
                json: true,
            });
    
            console.timeEnd("Schedule");

    
            // ===== CHANGE SCHEDULE ===== //
    
            console.time("Change schedule");

            const $ = cheerio.load(schedule.body);
    
            await rp({
                method: 'POST',
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx' + schedule.request.uri.search,
                formData: {
                    __EVENTTARGET: $('#__EVENTTARGET').val(),
                    __EVENTARGUMENT: $('#__EVENTARGUMENT').val(),
                    __LASTFOCUS: $('#__LASTFOCUS').val(),
                    __VIEWSTATE: $('#__VIEWSTATE').val(),
                    __VIEWSTATEGENERATOR: $('#__VIEWSTATEGENERATOR').val(),
                    'ThoiKhoaBieu1$cboHocKy': process.env.SCHEDULE,
                    'ThoiKhoaBieu1$radChonLua': 'radXemTKBTheoTuan',
                },
                resolveWithFullResponse: true,
                simple: false,
            });
        
            console.timeEnd("Change schedule");
    
    
            // ===== CURRENT SCHEDULE ===== //
    
            console.time("Current schedule");
    
            const currentSchedule = await rp({
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
                resolveWithFullResponse: true,
                json: true,
            });
    
            console.timeEnd("Current schedule");
            
            if (!next) return cheerioSchedule(currentSchedule.body);


            // ===== NEXT SCHEDULE ===== //

            console.time("Next schedule");
    
            await rp({
                method: 'POST',
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx' + currentSchedule.request.uri.search,
                formData: {
                    __EVENTTARGET: $('#__EVENTTARGET').val(),
                    __EVENTARGUMENT: $('#__EVENTARGUMENT').val(),
                    __LASTFOCUS: $('#__LASTFOCUS').val(),
                    __VIEWSTATE: $('#__VIEWSTATE').val(),
                    __VIEWSTATEGENERATOR: $('#__VIEWSTATEGENERATOR').val(),
                    'ThoiKhoaBieu1$cboHocKy': process.env.SCHEDULE,
                    'ThoiKhoaBieu1$radChonLua': 'radXemTKBTheoTuan',
                    'ThoiKhoaBieu1$btnTuanSau': 'Tuần sau|Following week >>',
                },
                resolveWithFullResponse: true,
                simple: false,
            });
        
            const nextSchedule = await rp({
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
                json: true,
            });
    
            console.timeEnd("Next schedule");

            return cheerioSchedule(nextSchedule);

        } catch(err) {
            return err;
        }
    }

    async getScore(mssv, pass, semester=process.env.SCORE , total=false) {
        try {
            await this.login(mssv, pass);


            // ===== SCORE HOME ===== //

            console.time("Score home");
    
            const scoreHome = await rp({
                uri: 'https://ketquahoctap.tdtu.edu.vn/home/',
            });
    
            console.timeEnd("Score home");

            const $score = cheerio.load(scoreHome);


            // ===== SCORE TOTAL ===== //
            if (total) {
                console.time("Score total");

                const scoreTotal = await rp({
                    uri: 'https://ketquahoctap.tdtu.edu.vn/Home/LayDiemTongHop',
                    qs: {
                        mssv: $score('#mssv').text(),
                        namvt: $score('#namvt').text(),
                        hedaotao: $score('#hedaotao').text(),
                        time: Date.now(),
                    },
                    json: true,
                });
        
                console.timeEnd("Score total");

                return scoreTotal;
            }


            // ===== SCORE ===== //

            console.time("Score");

            const score = await rp({
                uri: 'https://ketquahoctap.tdtu.edu.vn/Home/LayKetQuaHocTap',
                qs: {
                    mssv: $score('#mssv').text(),
                    nametable: semester,
                    hedaotao: $score('#hedaotao').text(),
                    time: Date.now(),
                },
                json: true,
            });
    
            console.timeEnd("Score");

            
            // ===== GPA ===== //

            console.time("GPA");

            const scoreGPA = await rp({
                uri: 'https://ketquahoctap.tdtu.edu.vn/Home/LayDTBHocKy',
                qs: {
                    lop: $score('#lop').text(),
                    mssv: $score('#mssv').text(),
                    tenBangDiem: semester,
                    time: Date.now(),
                },
                json: true,
            });
    
            console.timeEnd("GPA");

            score.push(scoreGPA);

            return score;

        } catch (err) {
            return err;
        }
    }

    async getScheduleSemester(mssv, pass) {
        try {
            await this.login(mssv, pass);

    
            // ===== SCHEDULE ===== //
    
            console.time("Schedule");
    
            const schedule = await rp({
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
            });
    
            console.timeEnd("Schedule");


            const $ = cheerio.load(schedule);

            let scheduleSemester = [];
            $('#ThoiKhoaBieu1_cboHocKy').find('option').each(function() {
                scheduleSemester.push({
                    text: $(this).text(),
                    value: $(this).val(),
                    isSelected: $(this).prop('selected') ? true : false,
                });
            });

            return scheduleSemester;

        } catch (error) {
            return error;
        }
    }

    async getScoreSemester(mssv, pass) {
        try {
            await this.login(mssv, pass);


            // ===== SCORE LANDING ===== //

            console.time("Score home");
    
            const scoreHome = await rp({
                uri: 'https://ketquahoctap.tdtu.edu.vn/home/',
            });
    
            console.timeEnd("Score home");


            const $ = cheerio.load(scoreHome);

            // ===== SCORE SEMESTER ===== //

            console.time("Score semester");

            const scoreSemester = await rp({
                uri: 'https://ketquahoctap.tdtu.edu.vn/Home/LayHocKy_KetQuaHocTap',
                qs: {
                    mssv: $('#mssv').text(),
                    namvt: $('#namvt').text(),
                    hedaotao: $('#hedaotao').text(),
                    time: Date.now(),
                },
                json: true,
            });
    
            console.timeEnd("Score semester");

            process.env.SCORE_SEMESTER = JSON.stringify(scoreSemester);

            return scoreSemester;

        } catch (err) {
            return err;
        }
    }
    
}

function setAuthCookie(jar, token) {
    const date = (new Date(86400000 + 1000*60*30 + +new Date())).toLocaleString();

    jar.setCookie(
        'AUTH_COOKIE=' + token + '|' + date + '; path=/', 
        'http://sso.tdt.edu.vn/Authenticate.aspx'
    );
}

function cheerioSchedule(html) {

    // console.time("Cheerio schedule");

    const $ = cheerio.load(html);
    const subjectList = [];

    const table = $('#ThoiKhoaBieu1_tbTKBTheoTuan > tbody');
    table.find('.rowContent').each(function(i, ele) {
        let start = i + 1; // start period
        let dateIdx = 1;

        $(this).find('.cell').each(function(i, ele) {
            dateIdx++;

            if ( !$(this).attr('rowspan') ) return; // skip td has no subject
            
            let periodLength = parseInt($(this).attr('rowspan')); // number of period

            let text = $(this).text();
            let date = table.find( '.Headerrow td:nth-child('+ dateIdx +')' ).text();

            let subjEndIdx = text.indexOf('|');

            let groupIdx = text.indexOf('Groups');
            let subGroupIdx = text.indexOf('Sub-group');
            let roomIdx = text.indexOf('Room');
            let noteIdx = text.indexOf('GV ');

            subjectList.push({
                'date': ( dateIdx === 8 ? 'CN ' : date.slice(0, 6) ) + date.slice(-7, date.length),
                'subject': text.substring(0, subjEndIdx),
                'period': Array(periodLength).fill().map((_, i) => i + start).join(','), // python range
                'group': text.substring(groupIdx + 8, groupIdx + 10).replace(/[^0-9a-z]/gi, ''),
                'subGroup': subGroupIdx === -1 ? "0" : text.substring(subGroupIdx + 11, subGroupIdx + 13).replace(/[^0-9a-z]/gi, ''),
                'room': text.substring(roomIdx + 6).replace('GV báo vắng', '').replace(' GV dạy bù', ''),
                'note': noteIdx === -1 ? '' : text.substring(noteIdx, text.length),
            });
        });
    });

    // console.timeEnd("Cheerio schedule");

    return subjectList.sort( (a,b) => (a.date).localeCompare(b.date) );
}

module.exports = new School;
