import "reflect-metadata";
import express from "express";
import path from "path";
import morgan from "morgan";

import "./configs/env";
import logger, { stream } from "./configs/logger";
import { route } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny", { stream }));
app.use(express.static(path.join(__dirname, "../public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Routes
route(app);

app.listen(PORT, () => {
  logger.info(`App listen: http://localhost:${PORT}`);
});
