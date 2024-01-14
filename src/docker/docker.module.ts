import { Module } from '@nestjs/common';
import { DockerController } from './docker.controller';
import { DockerService } from './docker.service';
import { UserModule } from 'src/user/user.module';
import { HistoryModule } from 'src/history/history.module';
import { BullModule } from '@nestjs/bull';
import { DockerQueueService } from './docker-queue.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule, UserModule, HistoryModule, BullModule.registerQueue({ name: 'docker-queue' })],
  controllers: [DockerController],
  providers: [DockerService, DockerQueueService],
})
export class DockerModule {}
