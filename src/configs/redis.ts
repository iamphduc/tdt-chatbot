import { createClient } from "redis";

import logger from "./logger";

async function connectRedis() {
  const client = createClient();

  client.on("error", (err) => {
    logger.error(`Redis Error: ${err}`);

    // Stop process without app crash
    process.exit(1);
  });

  client.on("connect", () => {
    logger.info(`Redis connected`);
  });

  await client.connect();
}
connectRedis();
