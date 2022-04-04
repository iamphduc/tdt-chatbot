import { createClient } from "redis";

import logger from "./logger";

type RedisClientType = ReturnType<typeof createClient>;

export class Redis {
  private static instance: RedisClientType;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    return Redis.instance;
  }

  public static async connect() {
    const client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on("error", (err) => {
      logger.error(`Redis Error: ${err}`);

      // Stop process without app crash
      process.exit(1);
    });

    client.on("connect", () => {
      logger.info(`Redis connected`);
    });

    await client.connect();

    Redis.instance = client;
  }
}
