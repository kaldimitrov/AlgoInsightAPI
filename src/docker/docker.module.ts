import { Module } from '@nestjs/common';
import { DockerController } from './docker.controller';
import { DockerService } from './docker.service';
import { RedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [RedisModule, UserModule, HistoryModule],
  controllers: [DockerController],
  providers: [DockerService],
})
export class DockerModule {}
