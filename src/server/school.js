
var rp = require('request-promise');
const cheerio = require('cheerio');

const currSemester = '109';

class School {

    constructor() {
        this.jar = rp.jar();
        rp = rp.defaults({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
            }
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
                jar: this.jar,
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
                    'ThoiKhoaBieu1$cboHocKy': currSemester == 0 ? $schedule('#ThoiKhoaBieu1_cboHocKy').find(':selected').val() : currSemester,
                    'ThoiKhoaBieu1$radChonLua': 'radXemTKBTheoTuan',
                },
                resolveWithFullResponse: true,
                simple: false,
                jar: this.jar,
            });
        
            console.timeEnd("Change schedule");
    
    
            // ===== CURRENT SCHEDULE ===== //
    
            console.time("Current schedule");
    
            const currentSchedule = await rp({
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
                resolveWithFullResponse: true,
                json: true,
                jar: this.jar,
            });
    
            console.timeEnd("Current schedule");


            // ===== NEXT SCHEDULE ===== //

            if (next) {
                
                console.time("Next schedule");

                const $schedule = cheerio.load(currentSchedule.body);
        
                await rp({
                    method: 'POST',
                    uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx' + currentSchedule.request.uri.search,
                    formData: {
                        __EVENTTARGET: $schedule('#__EVENTTARGET').val(),
                        __EVENTARGUMENT: $schedule('#__EVENTARGUMENT').val(),
                        __LASTFOCUS: $schedule('#__LASTFOCUS').val(),
                        __VIEWSTATE: $schedule('#__VIEWSTATE').val(),
                        __VIEWSTATEGENERATOR: $schedule('#__VIEWSTATEGENERATOR').val(),
                        'ThoiKhoaBieu1$cboHocKy': currSemester == 0 ? $schedule('#ThoiKhoaBieu1_cboHocKy').find(':selected').val() : currSemester,
                        'ThoiKhoaBieu1$radChonLua': 'radXemTKBTheoTuan',
                        'ThoiKhoaBieu1$btnTuanSau': 'Tuần sau|Following week >>',
                    },
                    resolveWithFullResponse: true,
                    simple: false,
                    jar: this.jar,
                });
            
        
                const nextSchedule = await rp({
                    uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
                    json: true,
                    jar: this.jar,
                });
        
                console.timeEnd("Next schedule");

                return this.cheerioSchedule(nextSchedule);
            }

            return this.cheerioSchedule(currentSchedule.body);

        } catch(err) {
            console.error(err);
        }
    }

    cheerioSchedule(html) {

        console.time("Cheerio");

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

        console.timeEnd("Cheerio");

        return subjectList;
    }

    async login(mssv, pass) {
        try {
            
            // ===== LOGIN ===== //
            
            console.time("\n====================\nLogin");
    
            const responseLogin = await rp({
                method: 'POST',
                uri: 'https://stdportal.tdtu.edu.vn/Login/SignIn?ReturnURL=https://stdportal.tdtu.edu.vn/',
                form: {
                    user: mssv,
                    pass: pass,
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                },
                resolveWithFullResponse: true,
                json: true,
                jar: this.jar,
            });
    
            console.timeEnd("\n====================\nLogin");
    
            
            // ===== AUTHENTICATION ===== //
    
            console.time("Authentication");
    
            await rp({
                uri: responseLogin.body.url,
                resolveWithFullResponse: true,
                simple: false,
                jar: this.jar,
            });
            
            console.timeEnd("Authentication");

        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = new School;
