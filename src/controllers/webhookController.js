
const request = require('request');

const scheduleHelper = require('../server/school');

const dateConst = require('../constants/dateConst.js');

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
async function handleMessage(sender_psid, received_message, self=false) {
    let message = received_message.text;
    let response = self ? { "text": message } : {  // default response
        "text": message == undefined ? `Bạn vừa nhấn nút like` : `Bạn vừa gửi: "${message}"` 
    };

    // Check if the message contains text
    if (message) {
        let mssv = (sender_psid == process.env.PSID) ? process.env.MSSV : process.env.GUEST_MSSV;
        let pass = (sender_psid == process.env.PSID) ? process.env.PASS : process.env.GUEST_PASS;

        if (message.toLowerCase().includes('login ')) {
            response = { "text": `Đã ghi nhận thông tin của bạn.\nNhớ xoá tin nhắn để bảo vệ tài khoản nhé!`,}

            process.env.GUEST_MSSV = message.slice(6, 6 + 8);
            process.env.GUEST_PASS = message.slice(6 + 8 + 1, message.length);

        } else if (equalsIn(message, 'week')) { // get current week
            
            if (mssv && pass) {

                await checkSchedule(mssv, pass, sender_psid);
    
                response = { "text": toMessage(process.env.SCHEDULE) }

            }

        } else if (equalsIn(message, 'today')) { // get today
            if (mssv && pass) {

                await checkSchedule(mssv, pass, sender_psid);

                const date = new Date().getDate();
                const schedule = JSON.parse(process.env.SCHEDULE);
                const todaySchedule = schedule.filter(ele => ele.date.includes(date));

                response = { "text": toMessage(todaySchedule) }

            }
            
        } else if (dateConst[message.toLowerCase()]) { // get weekday
            if (mssv && pass) {

                await checkSchedule(mssv, pass, sender_psid);

                const schedule = JSON.parse(process.env.SCHEDULE);
                const dateSchedule = schedule.filter(ele => ele.date.includes(dateConst[message.toLowerCase()]));

                response = { "text": toMessage(dateSchedule) }

            }
        } else if (equalsIn(message, 'update')) {
            if (mssv && pass) {

                await getSchedule(mssv, pass, sender_psid);

                response = { "text": toMessage(process.env.SCHEDULE) }

            }
        }

        console.log(`receive: '${message}'`);
        console.log(`reply: '${response.text}'`);
    }  
    
    // Sends the response message
    callSendAPI(sender_psid, response);    
}

// Compares string insensitive
function equalsIn(a, b) {
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
        : a === b;
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

// Check if schedule has been loaded
async function checkSchedule(mssv, pass, sender_psid) {
    if (!process.env.SCHEDULE) {

        try {

            await getSchedule(mssv, pass, sender_psid)

        } catch (err) {
            console.error(err);
        }
    }
}

// get schedule
async function getSchedule(mssv, pass, sender_psid) {

    handleMessage(sender_psid, { 'text': 'Bạn đợi mình lấy TKB nhé!' }, true);

    try {

        let subjectList = await scheduleHelper.getSchedule(mssv, pass);
        
        process.env.SCHEDULE = JSON.stringify(subjectList);

    } catch (err) {
        console.error(err);
    }
}

// Format schedule to readable message
function toMessage(schedule) {
    if (schedule.length == 0)
        return 'Không tìm thấy lịch học';

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

module.exports = new WebhookController()