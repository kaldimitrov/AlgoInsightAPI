import { Module } from '@nestjs/common';
import { SocketStateService } from './socket-state.service';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [UserModule, RedisModule],
  providers: [SocketStateService],
  exports: [SocketStateService],
})
export class SocketStateModule {}
