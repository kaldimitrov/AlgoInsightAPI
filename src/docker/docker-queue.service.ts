import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as Docker from 'dockerode';
import { getDockerSocketPath } from 'src/helpers/OsHelper';
import { REDIS } from 'src/redis/redis.constants';
import { RedisClient } from 'src/redis/redis.providers';
import { REDIS_DELAY, REDIS_RETRIES, TIMEOUT_JOB } from './constants';
import { ExecutionStatus } from 'src/history/enums/executionStatus';
import { Job, Queue } from 'bull';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { createLock } from 'ioredis-lock';

@Processor('docker-queue')
@Injectable()
export class DockerQueueService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DockerQueueService.name);
  private readonly docker = new Docker({ socketPath: getDockerSocketPath() });

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClient,
    @InjectQueue('docker-queue') private readonly dockerQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.dockerQueue.pause();
    await this.dockerQueue.removeJobs(`*`);
    await this.dockerQueue.resume();
  }

  @Process(TIMEOUT_JOB)
  async timeoutJob(job: Job<{ userId: number; containerId: string }>) {
    const { userId, containerId } = job.data;

    const lock = createLock(this.redisClient, {
      retries: REDIS_RETRIES,
      delay: REDIS_DELAY,
    });
    await lock.acquire(`lock:activeContainer-${userId}`);
    try {
      const redisContainers = JSON.parse(await this.redisClient.hget('activeContainers', String(userId))) || [];
      const indexToUpdate = redisContainers.findIndex((cont) => containerId === cont.id);

      if (indexToUpdate == -1) return;

      redisContainers[indexToUpdate] = {
        ...redisContainers[indexToUpdate],
        status: ExecutionStatus.TIMEOUT,
      };

      const container = this.docker.getContainer(containerId);
      if (!container) return;

      await this.redisClient.hset('activeContainers', String(userId), JSON.stringify(redisContainers));
      await container.stop({ t: 0 });
    } catch (e) {
      this.logger.error(`Timeout failed for user ${userId} and container ${containerId}`);
    } finally {
      await lock.release();
    }
  }
}
