
const request = require('request');

const school = require('../classes/school');
const { toScheduleMessage, toScoreMessage, toScoreTotalMessage } = require('./helpers/message.helper');

const weekday = {
    'mon' : 'Thứ 2',
    'tue' : 'Thứ 3',
    'wed' : 'Thứ 4',
    'thu' : 'Thứ 5',
    'fri' : 'Thứ 6',
    'sat' : 'Thứ 7',
    'sun' : 'CN',
    'today' : new Date().getDate(),
}


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
async function handleMessage(sender_psid, received_message, instant=false) {
    const message = received_message.text;
    let response = instant ? { "text": message } : { 
        "text": message == undefined ? `Like cái đầu * nhà bạn` : `Bạn vừa gửi: "${message}"` 
    };

    // Check if the message contains text
    if (message && !instant) {
        let account = getAccount(sender_psid);
        const lower = message.toLowerCase();

        try {
            switch(true) {
                case lower.includes('login'):
                    response = { "text": `Đã ghi nhận thông tin của bạn`,}
    
                    setAccount(
                        sender_psid,            // sender_pid
                        lower.slice(6, 6 + 8),  // mssv
                        lower.slice(6 + 8 + 1)  // pass
                    );
    
                    process.env.ACCOUNT_LIST = (process.env.ACCOUNT_LIST ? process.env.ACCOUNT_LIST : '') + ',' + sender_psid; 
    
                    break;
                        
                case !account: break;
    
                case ['week', 'week update'].includes(lower):
                    if (!account.week || lower.includes('update')) {
                        handleMessage(sender_psid, { 'text': 'Đợi mình lấy TKB tuần này nhé!' }, true);
                        account = await getSchedule(account);
                    }

                    const weekMessage = await toScheduleMessage(account.week);
                    
                    if (weekMessage) {
                        await splitMessage(sender_psid, weekMessage, 5);
                        return;
                    }
                    response = { "text": 'Tuần này không có lịch học' };
    
                    break;
    
                case weekday[lower] !== undefined:
                    if (!account.week) {
                        handleMessage(sender_psid, { 'text': 'Đợi mình lấy TKB tuần này nhé!' }, true);
                        account = await getSchedule(account);
                    }
    
                    const dateSchedule = await account.week.filter(ele => ele.date.includes(weekday[lower]));
                    const dateMessage = await toScheduleMessage(dateSchedule);

                    if (dateMessage)
                        response = { "text": dateMessage.join('\n') };
                    else
                        response = { "text": ( (typeof weekday[lower] === 'number') ? 'Hôm nay' : weekday[lower] ) + 
                        ' không có lịch học' };

                    break;
    
                case ['week next', 'week next update'].includes(lower):
                    if (!account.weekNext || lower.includes('update')) {
                        handleMessage(sender_psid, { 'text': 'Đợi mình lấy TKB tuần sau nhé!' }, true);
                        account = await getSchedule(account, true);
                    }
    
                    const weekNextMessage = await toScheduleMessage(account.weekNext);

                    if (weekNextMessage) {
                        await splitMessage(sender_psid, weekNextMessage, 5);
                        return;
                    }
                    response = { "text": 'Tuần sau không có lịch học' };
    
                    break;
    
                case ['score', 'score update'].includes(lower):
                    if (!account.score || lower.includes('update')) {
                        handleMessage(sender_psid, { 'text': 'Đợi mình lấy điểm nhé!' }, true);
                        account = await getScore(account);
                    }

                    const scoreMessage = await toScoreMessage(account.score);
                    await splitMessage(sender_psid, scoreMessage, 8);
                    return;

                    break;

                case ['score total', 'score total update'].includes(lower):
                    if (!account.scoreTotal || lower.includes('update')) {
                        handleMessage(sender_psid, { 'text': 'Đợi mình lấy điểm nhé!' }, true);
                        account = await getScore(account, undefined, true);
                    }

                    const scoreTotalMessage = await toScoreTotalMessage(account.scoreTotal);
                    await splitMessage(sender_psid, scoreTotalMessage, 8);
                    return;

                    break;
                
                case lower.includes('score -'):
                    const scoreSemester = JSON.parse(process.env.SCORE_SEMESTER);
                    const scoreTable = scoreSemester.map(ele => ele.NameTable);
                    const subfix = message.slice(7);

                    if (scoreTable.includes(subfix)) {
                        handleMessage(sender_psid, { 'text': 'Đợi mình lấy điểm nhé!' }, true);
                        account = await getScore(account, subfix);

                        const scoreMessage = await toScoreMessage(account.score);
                        await splitMessage(sender_psid, scoreMessage, 8);
                        return;
                    }

                    response = { "text": 'Bảng điểm không hợp lệ' };

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

function setAccount(sender_psid, mssv, pass, week='', weekNext='', score='', scoreTotal='', test='') {
    process.env[sender_psid] = JSON.stringify({ sender_psid, mssv, pass, week, weekNext, score, scoreTotal, test });
}

function getAccount(sender_psid) {
    return process.env[sender_psid] ? JSON.parse(process.env[sender_psid]) : '';
}

async function getSchedule(account, next=false) {
    const { sender_psid, mssv, pass, week , weekNext } = account;

    try {
        const subjectList = await school.getSchedule(mssv, pass, next);

        if (!next)
            setAccount(sender_psid, mssv, pass, subjectList, weekNext);
        else
            setAccount(sender_psid, mssv, pass, week, subjectList);
        
        return await getAccount(sender_psid);

    } catch (err) {
        console.error(err);
    }
}

async function getScore(account, semester=undefined, total=false) {
    const { sender_psid, mssv, pass, score , scoreTotal } = account;

    try {
        const scoreList = await school.getScore(mssv, pass, semester, total);
        
        if (!total)
            setAccount(sender_psid, mssv, pass, undefined, undefined, scoreList, scoreTotal);
        else
            setAccount(sender_psid, mssv, pass, undefined, undefined, score, scoreList);

        return await getAccount(sender_psid);

    } catch (err) {
        console.error(err);
    }
}

async function splitMessage(sender_psid, message, itemPerMessage=8) {
    try {
        const numberOfMessage = Math.floor(message.length / itemPerMessage);

        for (let i = 0; i <= numberOfMessage; i++) {
            await handleMessage(sender_psid, { 
                'text': message.slice(itemPerMessage * i, itemPerMessage * (i + 1)).join('\n') 
            }, true);
            await new Promise(r => setTimeout(r, 1000));
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = new WebhookController()
