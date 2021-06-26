
const webhookController = require('../controllers/webhook.controller');
const webController = require('../controllers/web.controller');


const route = (app) => {
    // webhook for facebook chatbot
    app.get('/webhook', webhookController.connect);
    app.post('/webhook', webhookController.handle);

    // web api
    app.post('/api/week', webController.getSchedule);
    app.post('/api/week-next', webController.getNextSchedule);
    app.post('/api/score', webController.getScore);
    app.post('/api/score-total', webController.getTotalScore);

    // web setting
    app.all('/setting', webController.setting);
    
    // quick test api
    // app.get('/test-get', webController.testGet);

    app.get('/', (req, res) => res.sendStatus(404));

}

module.exports = route
