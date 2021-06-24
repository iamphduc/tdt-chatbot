
var rp = require('request-promise');
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

            const $schedule = cheerio.load(schedule.body);
    
            await rp({
                method: 'POST',
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx' + schedule.request.uri.search,
                formData: {
                    __EVENTTARGET: $schedule('#__EVENTTARGET').val(),
                    __EVENTARGUMENT: $schedule('#__EVENTARGUMENT').val(),
                    __LASTFOCUS: $schedule('#__LASTFOCUS').val(),
                    __VIEWSTATE: $schedule('#__VIEWSTATE').val(),
                    __VIEWSTATEGENERATOR: $schedule('#__VIEWSTATEGENERATOR').val(),
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
            
            if (!next) { return this.cheerioSchedule(currentSchedule.body); }


            // ===== NEXT SCHEDULE ===== //

            console.time("Next schedule");
    
            await rp({
                method: 'POST',
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx' + currentSchedule.request.uri.search,
                formData: {
                    __EVENTTARGET: $schedule('#__EVENTTARGET').val(),
                    __EVENTARGUMENT: $schedule('#__EVENTARGUMENT').val(),
                    __LASTFOCUS: $schedule('#__LASTFOCUS').val(),
                    __VIEWSTATE: $schedule('#__VIEWSTATE').val(),
                    __VIEWSTATEGENERATOR: $schedule('#__VIEWSTATEGENERATOR').val(),
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

            return this.cheerioSchedule(nextSchedule);

        } catch(err) {
            console.error(err);
        }
    }

    cheerioSchedule(html) {

        console.time("Cheerio schedule");

        const $ = cheerio.load(html);

        let table = $('#ThoiKhoaBieu1_tbTKBTheoTuan > tbody');

        let subjectList = [];

        table.find('.rowContent').each(function(i, ele) {
            let start = i+1; // start period
            let dateIdx = 1;

            $(this).find('.cell').each(function(i, ele) {
                dateIdx++;

                if ( !$(this).attr('rowspan') ) return; // skip td has no subject
                
                let periodLength = parseInt($(this).attr('rowspan')); // number of period

                let text = $(this).text();

                let groupIdx = text.indexOf('Groups');
                let subGroupIdx = text.indexOf('Sub-group');
                let roomIdx = text.indexOf('Room');
                let subjEndIdx = text.indexOf('|');
                let noteIdx = text.indexOf('GV ')

                let date = table.find( '.Headerrow td:nth-child('+ dateIdx +')' ).text();

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

        // sort by date
        subjectList.sort(function(a,b) {
            if (a.date > b.date) return 1;
            if (a.date < b.date) return -1;
            return 0;
        });

        console.timeEnd("Cheerio schedule");

        return subjectList;
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
            console.log(err);
        }
    }

    cheerioScore(html) {

        const $ = cheerio.load(html);

        let table = $('#dl_kqht > tbody');

        let scoreList = [];

        table.find('tr').each(function() {
            
            scoreList.push({
                no:         getText(this, 1),
                course:     $(this).find('td:nth-child(2)').clone().children().remove().end().text()
                            .replace('Những kỹ năng thiết yếu cho sự phát triển bền vững - ', '')
                            .replace('Công nghệ thông tin', 'CNTT'),
                code:       getText(this, 3),
                credit:     getText(this, 4),
                group:      getText(this, 5),
                total:      getText(this, 6, true),
                prog1:      getText(this, 7, true),
                prog2:      getText(this, 8, true),
                mid:        getText(this, 9, true),
                final:      getText(this, 10, true),
                retest:     getText(this, 11, true),
                note:       getText(this, 12),
            });

        });

        function getText(self, nth, strong) {
            return $(self).find('td:nth-child('+ nth +')' + (strong ? ' strong' : '')).text().replace('()', '')
        }

        return scoreList;
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

            process.env.AUTHTOKEN = responseLogin.url.slice(-8);
            setAuthCookie(this.jar, process.env.AUTHTOKEN);
            
            console.timeEnd("\n========== REQUEST ==========\nLogin");

        } catch (err) {
            
        }
    }

    async getScheduleSemester(mssv, pass) {
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

            const $ = cheerio.load(schedule.body);

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

            const $score = cheerio.load(scoreHome);


            // ===== SCORE SEMESTER ===== //

            console.time("Score semester");

            const scoreSemester = await rp({
                uri: 'https://ketquahoctap.tdtu.edu.vn/Home/LayHocKy_KetQuaHocTap',
                qs: {
                    mssv: $score('#mssv').text(),
                    namvt: $score('#namvt').text(),
                    hedaotao: $score('#hedaotao').text(),
                    time: Date.now(),
                },
                json: true,
            });
    
            console.timeEnd("Score semester");

            return scoreSemester;

        } catch (err) {
            console.log(err);
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

module.exports = new School;
