
const webhookController = require('../controllers/webhookController');
const scheduleController = require('../controllers/scheduleController');


const route = (app) => {

    app.get('/webhook', webhookController.connect);
    
    app.post('/webhook', webhookController.handle);

    app.get('/', scheduleController.getSchedule);

}

module.exports = route
