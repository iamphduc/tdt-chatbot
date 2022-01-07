import dotenv from "dotenv";
import express from "express";
import path from "path";

dotenv.config();

import { route } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

// Routes
route(app);

app.listen(PORT, () => {
  console.log(`App listen: http://localhost:${PORT}`);
});
