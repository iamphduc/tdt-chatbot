const webhookController = require('../controllers/webhook.controller');
const apiController = require('../controllers/api.controller');
const settingController = require('../controllers/setting.controller');

const route = (app) => {
  // webhook for facebook chatbot
  app.get('/webhook', webhookController.connect);
  app.post('/webhook', webhookController.handle);

  // api
  app.post('/api/week', apiController.getSchedule);
  app.post('/api/week-next', apiController.getScheduleNext);
  app.post('/api/score', apiController.getScore);
  app.post('/api/score-all', apiController.getScoreAll);

  // setting
  app.get('/setting', settingController.getSetting);
  app.post('/setting', settingController.configurate);

  app.get('/', (req, res) => res.sendStatus(404));
};

module.exports = route;
