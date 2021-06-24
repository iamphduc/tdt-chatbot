
const path = require('path');

const engine = (app) => {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views/'));
}

module.exports = engine;
