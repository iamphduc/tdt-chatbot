import dotenv from "dotenv";
import path from "path";

function setUpEnvironment() {
  let fileName = ".env";

  if (process.env.NODE_ENV === "production") {
    fileName = ".env.prod";
  }

  dotenv.config({ path: path.join(__dirname, `../../${fileName}`) });
}
setUpEnvironment();
