import { Module } from '@nestjs/common';
import { DockerController } from './docker.controller';
import { DockerService } from './docker.service';
import { RedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [DockerController],
  imports: [RedisModule, UserModule],
  providers: [DockerService],
})
export class DockerModule {}
