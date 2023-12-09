import { Module } from '@nestjs/common';
import { DockerController } from './docker.controller';
import { DockerService } from './docker.service';
import { RedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { HistoryModule } from 'src/history/history.module';
import { BullModule } from '@nestjs/bull';
import { DockerQueueService } from './docker-queue.service';

@Module({
  imports: [RedisModule, UserModule, HistoryModule, BullModule.registerQueue({ name: 'docker-queue' })],
  controllers: [DockerController],
  providers: [DockerService, DockerQueueService],
})
export class DockerModule {}
