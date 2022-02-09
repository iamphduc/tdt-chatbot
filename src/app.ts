import dotenv from "dotenv";
import express from "express";
import path from "path";
import morgan from "morgan";

import { route } from "./routes";
import logger, { stream } from "./utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny", { stream }));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Routes
route(app);

app.listen(PORT, () => {
  logger.info(`App listen: http://localhost:${PORT}`);
});
