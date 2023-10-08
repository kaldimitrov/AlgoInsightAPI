import { Module } from '@nestjs/common';

import { redisProvider } from './redis.providers';

@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
