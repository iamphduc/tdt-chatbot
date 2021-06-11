
const rp = require('request-promise');
const cheerio = require('cheerio');

const { __EVENTTARGET, __EVENTARGUMENT, __LASTFOCUS, __VIEWSTATE, __VIEWSTATEGENERATOR } = require('../../constants/scheduleConst');


class ScheduleHelper {

    async scrapeSchedule(mssv, pass) {
        const jar = rp.jar();

        try {
    
            // ===== LOGIN ===== //
            
            console.time("\n====================\nLogin");;
    
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
                jar,
            });
    
            console.timeEnd("\n====================\nLogin");
    
            
            // ===== AUTHENTICATION ===== //
    
            console.time("Authentication");
    
            await rp({
                uri: responseLogin.body.url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                },
                resolveWithFullResponse: true,
                simple: false,
                jar,
            });
            
            console.timeEnd("Authentication");
    
    
            // ===== SCHEDULE ===== //
    
            console.time("Schedule");
    
            const schedule = await rp({
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                },
                resolveWithFullResponse: true,
                json: true,
                jar,
            });
    
            console.timeEnd("Schedule");
    
    
            // ===== CHANGE SCHEDULE ===== //
    
            console.time("Change schedule");
    
            await rp({
                method: 'POST',
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx' + schedule.request.uri.search,
                formData: {
                    __EVENTTARGET,
                    __EVENTARGUMENT,
                    __LASTFOCUS,
                    __VIEWSTATE,
                    __VIEWSTATEGENERATOR,
                    'ThoiKhoaBieu1$cboHocKy': '109',
                    'ThoiKhoaBieu1$radChonLua': 'radXemTKBTheoTuan',
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                },
                resolveWithFullResponse: true,
                simple: false,
                jar,
            });
        
            console.timeEnd("Change schedule");
    
    
            // ===== NEW SCHEDULE ===== //
    
            console.time("Current schedule");
    
            const html = await rp({
                uri: 'https://lichhoc-lichthi.tdtu.edu.vn/tkb2.aspx',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
                },
                json: true,
                jar,
            });
    
            console.timeEnd("Current schedule");

            return html;

        } catch(err) {
            console.error(err);
        }
    }

    parseSchedule(html) {
    
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
                
                let length = parseInt($(this).attr('rowspan'));
                let groupIdx = $(this).text().indexOf('Groups');
                let subGroupIdx = $(this).text().indexOf('Sub-group');
                let roomIdx = $(this).text().indexOf('Room:');

                let date = table.find( '.Headerrow td:nth-child('+ dateIdx +')' ).text();

                subjectList.push({
                    'date': date.slice(0, (dateIdx == 8) ? 9 : 6) + date.slice(-7, date.length),    // slice for Chu nhat
                    'subject': $(this).find('b').clone().children().remove().end().text(),          // this is not good !
                    'period': Array(length).fill().map((_, i) => i + start).join(','),              // similar to python range
                    'group': $(this).text().substring(groupIdx + 8, groupIdx + 10).replace(/[^0-9a-z]/gi, ''),
                    'subGroup': subGroupIdx === -1 ? "0" : $(this).text().substring(subGroupIdx + 11, subGroupIdx + 13).replace(/[^0-9a-z]/gi, ''),
                    'room': $(this).text().substring(roomIdx + 6).replace(/[^0-9a-z]/gi, ''),
                });
                
            });
        });

        // sort by date
        subjectList.sort(function(a,b) {
            if (a.date > b.date) return 1;
            else if (a.date < b.date) return -1;
            return 0;
        });

        console.timeEnd("Cheerio");

        return subjectList;
    }
}

module.exports = new ScheduleHelper;
