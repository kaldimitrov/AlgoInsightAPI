import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS, REDIS_BULL } from './redis.constants';
import { ConfigService } from '@nestjs/config';

export type RedisClient = Redis;

export const redisProviders: Provider[] = [
  {
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<RedisClient> => {
      return new Redis({
        host: configService.get('redis.base.host'),
        port: configService.get('redis.base.port'),
        db: configService.get('redis.base.database'),
      });
    },
    provide: REDIS,
  },
  {
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<RedisClient> => {
      return new Redis({
        host: configService.get('redis.base.host'),
        port: configService.get('redis.base.port'),
        db: configService.get('redis.base.database'),
      });
    },
    provide: REDIS_BULL,
  },
];
