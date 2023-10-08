import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const defaultFormats = [
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    return `${timestamp} ${level.toUpperCase()} [${metadata?.context || ''}]: ${message}`;
  }),
];

const filterNoErrors = winston.format((info) => {
  if (info.level !== 'error') {
    return info;
  }
  return false;
});

export const winstonOptions: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  format: winston.format.combine(...defaultFormats),
  transports: [
    new winston.transports.Console({
      format: nestWinstonModuleUtilities.format.nestLike(),
    }),

    new winston.transports.DailyRotateFile({
      dirname: './logs/error',
      filename: '%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '500m',
      maxFiles: '7d',
      level: 'error',
    }),
    new winston.transports.DailyRotateFile({
      dirname: './logs',
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '1g',
      maxFiles: '30d',
      frequency: '168h',
      format: winston.format.combine(filterNoErrors(), ...defaultFormats),
    }),
  ],
};
