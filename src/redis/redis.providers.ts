import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS } from './redis.constants';
import { ConfigService } from '@nestjs/config';

export type RedisClient = Redis;

export const redisProvider: Provider = {
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<RedisClient> => {
    return new Redis({
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
    });
  },
  provide: REDIS,
};
