import { Module } from '@nestjs/common';
import { DockerController } from './docker.controller';
import { NodeJsDockerService } from './services/nodejs-docker.service';

@Module({
  controllers: [DockerController],
  providers: [NodeJsDockerService],
})
export class DockerModule {}
