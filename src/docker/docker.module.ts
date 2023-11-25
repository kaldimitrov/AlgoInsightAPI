import { Module } from '@nestjs/common';
import { DockerController } from './docker.controller';
import { DockerService } from './docker.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [DockerController],
  imports: [RedisModule],
  providers: [DockerService],
})
export class DockerModule {}
