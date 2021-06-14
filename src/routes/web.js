
const webhookController = require('../controllers/webhook.controller');
const homeController = require('../controllers/home.controller');


const route = (app) => {

    app.get('/webhook', webhookController.connect);
    
    app.post('/webhook', webhookController.handle);

    app.post('/api/current', homeController.getSchedule);

    app.post('/api/next', homeController.getNextSchedule);

    app.get('/', (req, res) => { res.sendStatus(404) });

}

module.exports = route
