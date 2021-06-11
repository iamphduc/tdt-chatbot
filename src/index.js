
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const router = require('./routes/web');


app.use(express.json()); // handle XMLHttpRequest, fetch,...
app.use(express.urlencoded({ extended: true })); // handle FormData


router(app);


app.listen(port, () => {
    console.log(`App: http://localhost:${port}`);
})
