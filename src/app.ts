import dotenv from "dotenv";
import express from "express";

const router = require("./routes/index.routes");
const viewEngine = require("./configs/viewEngine");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // handle XMLHttpRequest, fetch,...
app.use(express.urlencoded({ extended: true })); // handle FormData

viewEngine(app);
router(app);

app.listen(port, () => {
  console.log(`App listen: http://localhost:${port}`);
});
