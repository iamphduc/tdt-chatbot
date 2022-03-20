/* eslint-disable arrow-body-style */
import winston from "winston";

const { createLogger, format, transports } = winston;

const formatPrint = format.printf(({ level, message, label = "Server", timestamp }) => {
  return `${timestamp} | ${level} - [${label}]: "${message}"`;
});

const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),

    // Allows for logging Error instances
    // Ex: logger.warn(new Error('Error passed as info'));
    format.errors({ stack: true }),

    // Allows for string interpolation
    // Ex: logger.info('Found %s at %s', 'error', new Date());
    format.splat(),

    // Allows for JSON logging
    // Ex: logger.log({ level: 'info', message: 'Pass an object' });
    format.json(),

    formatPrint
  ),
  transports: [
    // Write all logs with level `debug` to the `console`
    new transports.Console({
      format: format.combine(format.colorize(), formatPrint),
    }),

    // Write all logs with level `error` and below to `error.log`
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // Write all logs with level `debug` and below to `debug.log`
    new transports.File({
      filename: "logs/debug.log",
    }),
  ],
});

export const stream = {
  write: (message: string) => logger.http(message.replace(/\n$/, "")),
};

export default logger;
