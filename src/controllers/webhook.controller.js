
const request = require('request');

const school = require('../server/school');

const weekdayConst = require('../constants/weekday.const.js');


class WebhookController {

    // [GET] ./webhook
    connect(req, res) {
        // Your verify token. Should be a random string.
        let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
            
        // Parse the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];
    
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            
                // Responds with the challenge token from the request
                console.log('WEBHOOK_VERIFIED');
                res.status(200).send(challenge);
            
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);      
            }
        }
    }

    // [POST] ./webhook
    handle(req, res) {
     
        let body = req.body;
      
        // Checks this is an event from a page subscription
        if (body.object === 'page') {
      
            // Iterates over each entry - there may be multiple if batched
            body.entry.forEach(function(entry) {
        
                // Gets the message. entry.messaging is an array, but 
                // will only ever contain one message, so we get index 0
                let webhook_event = entry.messaging[0];
    
                // Get the sender PSID
                let sender_psid = webhook_event.sender.id;
                console.log('\nSender PSID: ' + sender_psid);
    
                // Check if the event is a message 
                if (webhook_event.message) {

                    handleMessage(sender_psid, webhook_event.message);        
                }
    
            });
        
            // Returns a '200 OK' response to all requests
            res.status(200).send('EVENT_RECEIVED');
        } else {
            // Returns a '404 Not Found' if event is not from a page subscription
            res.sendStatus(404);
        }
      
    }

}

// Handles messages events
async function handleMessage(sender_psid, received_message, reply=false) {
    let message = received_message.text;
    let response = reply ? { "text": message } : {  // default response
        "text": message == undefined ? `Bạn vừa nhấn nút like` : `Bạn vừa gửi: "${message}"` 
    };

    // Check if the message contains text
    if (message) {
        let account = getAccount(sender_psid);
        let lower = message.toLowerCase();

        try {
            switch(true) {
                case lower.includes('login '):
                    response = { "text": `Đã ghi nhận thông tin của bạn.\nNhớ xoá tin nhắn để bảo vệ tài khoản nhé!`,}
    
                    setAccount(
                        sender_psid,                            // sender id
                        lower.slice(6, 6 + 8),                  // mssv
                        lower.slice(6 + 8 + 1, lower.length)    // pass
                    );
    
                    process.env.account = (process.env.account ? process.env.account : '') + ',' + sender_psid; 
    
                    break;
    
                case !account: break;
    
                case lower == 'week':
                    if (!account.current) {
                        handleMessage(sender_psid, { 'text': 'Bạn đợi mình lấy TKB tuần này nhé!' }, true);
    
                        await getSchedule(account);
                        account = await getAccount(sender_psid);
                    }
                    
                    response = { 
                        "text": toScheduleMessage(account.current) ? toScheduleMessage(account.current) : 'Tuần này không có lịch học' 
                    }
    
                    break;
    
                case lower == 'today':
                    if (!account.current) {
                        handleMessage(sender_psid, { 'text': 'Bạn đợi mình lấy TKB tuần này nhé!' }, true);
    
                        await getSchedule(account);
                        account = await getAccount(sender_psid);
                    }
    
                    const date = new Date().getDate();
                    const todaySchedule = account.current.filter(ele => ele.date.includes(date));
    
                    response = { 
                        "text": toScheduleMessage(todaySchedule) ? toScheduleMessage(todaySchedule) : 'Hôm nay không có lịch học'
                    }
    
                    break;
    
                case weekdayConst[lower] !== undefined:
                    if (!account.current) {
                        handleMessage(sender_psid, { 'text': 'Bạn đợi mình lấy TKB tuần này nhé!' }, true);
    
                        await getSchedule(account);
                        account = await getAccount(sender_psid);
                    }
    
                    const dateSchedule = account.current.filter(ele => ele.date.includes(weekdayConst[lower]));
    
                    response = { 
                        "text": toScheduleMessage(dateSchedule) ? toScheduleMessage(dateSchedule) : (weekdayConst[lower] + ' không có lịch học')
                    }
    
                    break;
    
                case lower == 'update':
                    handleMessage(sender_psid, { 'text': 'Bạn đợi mình cập nhật TKB tuần này nhé!' }, true);

                    await getSchedule(account);
                    account = await getAccount(sender_psid);
    
                    response = { 
                        "text": toScheduleMessage(account.current) ? toScheduleMessage(account.current) : 'Tuần này không có lịch học' 
                    }
    
                    break;
    
                case lower == 'next':
                    if (!account.next) {
                        handleMessage(sender_psid, { 'text': 'Bạn đợi mình lấy TKB tuần sau nhé!' }, true);
    
                        await getSchedule(account, true);
                        account = await getAccount(sender_psid);
                    }
    
                    response = { 
                        "text": toScheduleMessage(account.next) ? toScheduleMessage(account.next) : 'Tuần sau không có lịch học' 
                    }
    
                    break;
    
                case lower == 'next update':
                    handleMessage(sender_psid, { 'text': 'Bạn đợi mình cập nhật TKB tuần sau nhé!' }, true);
    
                    await getSchedule(account, true);
                    account = await getAccount(sender_psid);
    
                    response = { 
                        "text": toScheduleMessage(account.next) ? toScheduleMessage(account.next) : 'Tuần sau không có lịch học' 
                    }
    
                    break;
    
                case lower.includes('score '):
                    let semester = lower.slice(6);
                    
                    // default score
                    if (semester == '.') {
                        if (!account.score) {
                            handleMessage(sender_psid, { 'text': 'Bạn đợi mình lấy điểm nhé!' }, true);
    
                            await getScore(account);
                            account = await getAccount(sender_psid);
                        }

                        const scoreMessage = toScoreMessage(account.score);
                        const halfLength = Math.floor(scoreMessage.length / 2);

                        await handleMessage(sender_psid, { 
                            'text': scoreMessage.slice(0, halfLength).join('\n') 
                        }, true);

                        await new Promise(r => setTimeout(r, 1000));

                        await handleMessage(sender_psid, { 
                            'text': scoreMessage.slice(halfLength, scoreMessage.length).join('\n') 
                        }, true);

                        response = { "text": '' }
                    }
                    
                    // total score
                    else if (semester == 'total') {
                        if (!account.scoreTotal) {
                            handleMessage(sender_psid, { 'text': 'Bạn đợi mình lấy điểm nhé!' }, true);
    
                            await getScore(account, undefined, true);
                            account = await getAccount(sender_psid);
                        }

                        const scoreTotalMessage = toScoreTotalMessage(account.scoreTotal);
                        const quarterLength = Math.floor(scoreTotalMessage.length / 4);

                        // 1/4 -> 3/4
                        for (let i = 0; i <= 2; i++) {
                            await handleMessage(sender_psid, { 
                                'text': scoreTotalMessage.slice(quarterLength * i, quarterLength * (i+1) ).join('\n') 
                            }, true);
                            await new Promise(r => setTimeout(r, 1000));
                        }

                        // 4/4
                        await handleMessage(sender_psid, { 
                            'text': scoreTotalMessage.slice(quarterLength * 3, quarterLength.length).join('\n') 
                        }, true);
                        await new Promise(r => setTimeout(r, 1000));

                        response = { "text": '' }
                    }

                    else if (process.env.SCORE)

                    break;
                    
            }
        } catch (err) {
            console.log(err);
        }
        

        console.log(`receive: '${message}'`);
        console.log(`reply: '${response.text}'`);
    }  
    
    // Sends the response message
    callSendAPI(sender_psid, response);    
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": { "id": sender_psid },
        "message": response,
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {

        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

function setAccount(sender_psid, mssv, pass, current='', next='', score='', scoreTotal='', test='') {
    process.env[sender_psid] = JSON.stringify(
        { sender_psid, mssv, pass, current, next, score, scoreTotal, test,}
    );
}

function getAccount(sender_psid) {
    return process.env[sender_psid] ? JSON.parse(process.env[sender_psid]) : '';
}

async function getSchedule(account, next=false) {
    const { sender_psid, mssv, pass, currentWeek , nextWeek } = account;

    try {

        let subjectList = await school.getSchedule(mssv, pass, next);

        if (!next) setAccount(sender_psid, mssv, pass, subjectList, nextWeek);
        else setAccount(sender_psid, mssv, pass, currentWeek, subjectList);
        
    } catch (err) {
        console.error(err);
    }
}

function toScheduleMessage(schedule) {
    if (schedule.length == 0)
        return '';

    if (typeof schedule === 'string')
        schedule = JSON.parse(schedule);

    let readableSchedule = schedule.map((ele) => {
        return `===== ${ ele.date } =====\n` +
            (ele.note === '' ? `` : `-----> ${ ele.note }\n`) + 
            `Môn: ${ ele.subject }\n` +
            `Tiết: ${ ele.period }\n` +
            `Nhóm: ${ ele.group }` + (ele.subGroup == 0 ? `` : `  -  Tổ: ${ ele.subGroup }`) + `\n` +
            `Phòng: ${ ele.room }\n`
    });

    return readableSchedule.join('\n');
}

async function getScore(account, semester=undefined, total=false) {
    const { sender_psid, mssv, pass, score , scoreTotal } = account;

    try {

        let scoreList = await school.getScore(mssv, pass, semester, total);
        
        if (!total) setAccount(sender_psid, mssv, pass, undefined, undefined, scoreList, scoreTotal);
        else setAccount(sender_psid, mssv, pass, undefined, undefined, score, scoreList);
        
    } catch (err) {
        console.error(err);
    }
}

function toScoreMessage(score) {
    if (score.length == 0)
        return '';

    if (typeof score === 'string')
        score = JSON.parse(score);

    /* 
        "MSSV": "51900790",
        "MonHocID": "503073",
        "TenMH": "Lập trình web và ứng dụng",
        "TenMH_TA": "Web Programming and Applications",
        "Nhom_To": "23",
        "Diem1": "9.0",
        "Diem2": "10",
        "DiemThi1": "6.0",
        "DiemThi2": "",
        "DTB": "7.7",
        "SoTC": "3",
        "NgayCongBoDTB": "2021-06-18 18:43:55",
        "NgayCongBoDiemThi1": "2021-06-18 18:43:55",
        "NgayCongBoDiemThi2": "",
        "NgayCongBoDiem1": "2021-06-18 18:43:55",
        "NgayCongBoDiem2": "2021-04-12 16:56:41",
        "Diem1_1": "9.0",
        "NgayCongBoDiem1_1": "2021-06-04 20:21:55",
        "GhiChu": ""
    */

    /*
        "ID": 507447,
        "MSSV": "51900790",
        "LopID": "19050402",
        "NHHK": null,
        "DTBHocKy": "8.06",
        "TCDat": "14",
        "DTBTL": "7.93",
        "TCTL": "57"
    */

    let readableScore = score.map((ele, i) => {
        if (i+1 == score.length) {
            if (ele == null) 
                return `=======|  [ GPA ]  |=======\n` +
                    `----->  Không có điểm \n`;

            return `=======|  [ GPA ]  |=======\n` +
                `ĐTB học kỳ: ${ ele.DTBHocKy }\n` +
                `Tín chỉ đạt: ${ ele.TCDat }\n` +
                `ĐTB tích luỹ: ${ ele.DTBTL }\n` +
                `Tín chỉ tích luỹ: ${ ele.TCTL }\n`;
        }
         
        return `=======|  [ ${ i+1 } ]  |=======\n` +
            `Môn: ${ ele.TenMH
                .replace('Những kỹ năng thiết yếu cho sự phát triển bền vững - ', '')
                .replace('Công nghệ thông tin', 'CNTT') }\n` +
            `Mã môn: ${ ele.MonHocID }\n` +
            `Nhóm: ${ ele.Nhom_To }  |  Tín chỉ: ${ ele.SoTC }\n` +
            `QT_1: ${ ele.Diem1 }  -  QT_2: ${ ele.Diem1_1 }\n` +
            `Giữa kỳ: ${ ele.Diem2 }  -  Cuối kỳ: ${ ele.DiemThi1 }\n` +
            `----->  ĐTB: ${ ele.DTB }  <-----\n` +
            `Ghi chú: ${ (ele.GhiChu == '') ? 'không' : ele.GhiChu }\n`
    });

    return readableScore;
}

function toScoreTotalMessage(score) {
    if (score.length == 0)
        return '';

    if (typeof score === 'string')
        score = JSON.parse(score);

    /* 
        "MSSV": "51900790",
        "MonHocID": "302053",
        "TenMH": "Pháp luật đại cương",
        "TenMH_TA": "Introduction to Laws",
        "Nhom_To": null,
        "Diem1": null,
        "Diem2": null,
        "DiemThi1": null,
        "DiemThi2": null,
        "DTB": "8.2",
        "SoTC": "2",
        "NgayCongBoDTB": null,
        "NgayCongBoDiemThi1": null,
        "NgayCongBoDiemThi2": null,
        "NgayCongBoDiem1": null,
        "NgayCongBoDiem2": null,
        "Diem1_1": null,
        "NgayCongBoDiem1_1": null,
        "GhiChu": null
    */

    let readableScore = score.map((ele, i) => {        
        return `=======|  [ ${ i+1 } ]  |=======\n` +
            `Môn: ${ ele.TenMH
                .replace('Những kỹ năng thiết yếu cho sự phát triển bền vững - ', '')
                .replace('Công nghệ thông tin', 'CNTT') }\n` +
            `Mã môn: ${ ele.MonHocID }\n` +
            `Tín chỉ: ${ ele.SoTC }\n` +
            `----->  ĐTB: ${ ele.DTB }  <-----\n`
    });

    return readableScore;
}

module.exports = new WebhookController()