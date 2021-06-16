
const request = require('request');

const school = require('../server/school');

const weekdayConst = require('../constants/weekday.const.js');
const { currSemester, scoreSemester } = require('../constants/school.const');

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
        // setAccount(sender_psid, '51900790', '51900790');
        let account = getAccount(sender_psid);
        let lower = message.toLowerCase();

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

            case lower.includes('score'):
                let semester = lower.slice(6);


                break;

            case lower == 'score total':
                break;
                
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
        return `===== ${ele.date} =====\n` +
            (ele.note === '' ? `` : `-----> ${ele.note}\n`) + 
            `Môn: ${ele.subject}\n`+
            `Tiết: ${ele.period}\n`+
            `Nhóm: ${ele.group}` + (ele.subGroup == 0 ? `` : ` - Tổ: ${ele.subGroup}`) + `\n`+
            `Phòng: ${ele.room}\n`
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

module.exports = new WebhookController()