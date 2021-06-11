
const request = require('request');

const scheduleHelper = require('./helpers/scheduleHelper');
const webhookHelper = require('./helpers/webhookHelper');


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
async function handleMessage(sender_psid, received_message) {
    let message = received_message.text;
    let response = { "text": `Invalid message: "${message}"` }; // default failed response

    // Check if the message contains text
    if (message) {
        let mssv = (sender_psid == process.env.PSID) ? process.env.MSSV : process.env.GUEST_MSSV;
        let pass = (sender_psid == process.env.PSID) ? process.env.PASS : process.env.GUEST_PASS;

        if ( equalsIn(message, 'hello') || equalsIn(message, 'chào') || 
        equalsIn(message, 'hi') || equalsIn(message, 'test') ) {
            response = { 
                "text": `You sent the message: "${received_message.text}"`,
            }

        } else if (message.includes('ssv: ')) {
            response = { 
                "text": `Config MSSV`,
            }

            process.env.GUEST_MSSV = message.slice(6);

        } else if (message.includes('ass: ')) {
            response = { 
                "text": `Config password`,
            }

            process.env.GUEST_PASS = message.slice(6);

        } else if (equalsIn(message, 'tkb')) {
            
            if (!mssv || !pass) {

                response = { "text": `INVALID USER`, }

            } else {

                if (!process.env.SCHEDULE) {
                    try {
    
                        let html = await scheduleHelper.scrapeSchedule(mssv, pass);
        
                        let subjectList = scheduleHelper.parseSchedule(html) || 'Failed';
                        
                        process.env.SCHEDULE = JSON.stringify(subjectList);
    
                    } catch (err) {
                        console.error(err);
                    }
                }
    
                response = { 
                    "text": webhookHelper.formatSchedule(process.env.SCHEDULE).join('\n\n'),
                }

            }
        }

        console.log(`receive: ${message}`);
        console.log(`reply: ${response.text}`);
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
        "recipient": {
        "id": sender_psid
        },
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
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

module.exports = new WebhookController()