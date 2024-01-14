import { BadRequestException, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import { Container } from './models/container.model';
import { getFileContent } from 'src/helpers/FileHelper';
import { ExecStep } from './models/execStep.model';
import { getDockerSocketPath, getLogLevel } from 'src/helpers/OsHelper';
import { REDIS } from 'src/shared/redis/redis.constants';
import { RedisClient } from 'src/shared/redis/redis.providers';
import { MB_SIZE, REDIS_DELAY, REDIS_RETRIES, TIMEOUT_JOB } from './constants';
import { TRANSLATIONS } from 'src/config/translations';
import { UserService } from 'src/user/user.service';
import { HistoryService } from 'src/history/history.service';
import { Languages } from './enums/languages';
import { ExecutionStatus } from 'src/history/enums/executionStatus';
import { addLogInformation, removeControlCharacters } from 'src/helpers/StringHelper';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { createLock } from 'ioredis-lock';
import * as moment from 'moment-timezone';
import { RedisPropagatorService } from 'src/shared/redis-propagator/redis-propagator.service';

/*
TODO:
 - add tags to history so users can search by it
 - add auth using google and other providers
 - possibly compress logged data
*/

@Injectable()
export class DockerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DockerService.name);
  private readonly docker = new Docker({ socketPath: getDockerSocketPath() });

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClient,
    private readonly userService: UserService,
    private readonly historyService: HistoryService,
    @InjectQueue('docker-queue') private readonly dockerQueue: Queue,
    private readonly redisPropagatorService: RedisPropagatorService,
  ) {}

  async onApplicationBootstrap() {
    const activeContainers = await this.redisClient.hgetall('activeContainers');

    for (const [key, value] of Object.entries(activeContainers)) {
      const containers = JSON.parse(value);

      containers.forEach(async (cont: { id: string }) => {
        this.docker.getContainer(cont.id).remove({ force: true }, (error) => {
          if (error) {
            this.logger.error(`Error removing container with id ${cont.id} from user ${key} ` + error.message);
          }
        });
      });
    }

    await this.redisClient.del('activeContainers');
  }

  getExecutionStatus(userId: number) {
    return this.redisClient.hget('activeContainers', String(userId));
  }

  async execute(code: string, containerSettings: Container, userId: number, language: Languages) {
    const user = await this.userService.findOne(userId);
    const lock = createLock(this.redisClient, {
      retries: REDIS_RETRIES,
      delay: REDIS_DELAY,
    });

    let userContainers = JSON.parse(await this.redisClient.hget('activeContainers', String(userId))) || [];
    const userContainersCount = userContainers.length;
    if (userContainersCount >= user.execution_concurrency) {
      throw new BadRequestException(TRANSLATIONS.errors.execution.active_containers_limit);
    }

    if (code.length > user.max_code_length) {
      throw new BadRequestException(TRANSLATIONS.errors.execution.max_code_length);
    }

    const history = await this.historyService.createHistory({ user_id: userId, language });

    let container: Docker.Container;
    try {
      await this.pullImage(containerSettings.image, containerSettings.version);
      container = await this.docker.createContainer({
        Image: `${containerSettings.image}:${containerSettings.version}`,
        Tty: true,
        name: `container-${userId}-${userContainersCount}`,
        WorkingDir: '/app',
        NetworkDisabled: true,
        HostConfig: {
          Memory: MB_SIZE * user.max_memory_limit,
          NetworkMode: 'none',
        },
      });

      await this.dockerQueue.add(
        TIMEOUT_JOB,
        { userId: user.id, containerId: container.id },
        {
          jobId: `dockerTimeout-${userId}-${userContainersCount}`,
          delay: user.max_runtime_duration,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );

      await lock.acquire(`lock:activeContainer-${user.id}`);
      const userContainers = JSON.parse(await this.redisClient.hget('activeContainers', String(userId))) || [];
      userContainers.push({ id: container.id, status: ExecutionStatus.PENDING });
      await this.redisClient.hset('activeContainers', String(userId), JSON.stringify(userContainers));
      await lock.release();

      await container.start();
      await this.addContainerFiles(container, [
        {
          name: 'bash.sh',
          content: getFileContent(`${__dirname}/templates/bash.sh`, '{{file_name}}', `${history.id}.txt`),
        },
        { name: containerSettings.fileName, content: code },
      ]);

      const statsStream = await container.stats({ stream: true });
      statsStream.on('data', (data) => {
        const time = Date.now();
        const processedData = this.processContainerStats(JSON.parse(data.toString('utf-8').replace(/\n/g, '')));

        if (processedData) {
          this.redisPropagatorService.emitToUser({
            event: 'newStats',
            userId: userId,
            data: { time, cpu: processedData.cpu, memory: processedData.memory },
          });

          history.stats.push({ time, cpu: processedData.cpu, memory: processedData.memory });
        }
      });

      for (const execStep of containerSettings.execution) {
        history.logs = history.logs.concat(removeControlCharacters(await this.execStep(container, execStep)));
      }
      
    } catch (error) {
      history.status = ExecutionStatus.ERRORED;
      this.logger.error('Error running docker', error);
    } finally {
      if (!container) {
        return;
      }

      if (!(await container.inspect()).State.Running) {
        await container.start();
      }
      const usageData = this.computeMaxStats(history.stats);
      const timeData = await this.getTimeResults(container, `/tmp/${history.id}.txt`);

      container.remove({ force: true }, (error) => {
        if (error) {
          this.logger.error(`Error removing container with id ${container.id}` + error.message);
        }
      });

      await lock.acquire(`lock:activeContainer-${user.id}`);
      userContainers = JSON.parse(await this.redisClient.hget('activeContainers', String(userId))) || [];

      const redisContainer = userContainers.find((cont: { id: string }) => cont.id == container.id);
      if (redisContainer?.status == ExecutionStatus.TIMEOUT) {
        history.status = ExecutionStatus.TIMEOUT;
      }

      userContainers = userContainers.filter((cont: { id: string }) => cont.id != container.id);
      if (userContainers.length) {
        await this.redisClient.hset('activeContainers', String(userId), JSON.stringify(userContainers));
      } else {
        await this.redisClient.hdel('activeContainers', String(userId));
      }
      await lock.release();

      if (history.status == ExecutionStatus.PENDING) {
        history.status = ExecutionStatus.SUCCESS;
      }

      this.redisPropagatorService.emitToUser({
        event: 'executionStatus',
        userId: user.id,
        data: { status: history.status, id: history.id },
      });

      return this.historyService.updateHistory({
        ...history,
        max_cpu: usageData.maxCPU,
        max_memory: usageData.maxMemory,
        start_time: timeData.startTime,
        end_time: timeData.endTime,
        execution_time: timeData.totalTime,
      });
    }
  }

  private async execStep(container: Docker.Container, execStep: ExecStep) {
    const userId = parseInt((await container.inspect()).Name.split('-')[1]);
    const executionCount = parseInt((await container.inspect()).Name.split('-')[2]);

    const exec = await container.exec({
      Cmd: [execStep.cmd, ...execStep.params],
      AttachStdout: true,
      AttachStderr: true,
    });

    const execStart = await exec.start({});
    const stepOutput: string = await new Promise((resolve, reject) => {
      let output = '';
      execStart.on('data', (data) => {
        const logLevel = getLogLevel(data.readUInt8(0));
        const currentTime = moment().tz('GMT').format('HH:mm:ss.S');
        const newLog = removeControlCharacters(
          addLogInformation(`[${logLevel} ${currentTime}]: ${data.slice(8).toString('utf-8')}`, logLevel, currentTime),
        );

        if (execStep.log) {
          output = output.concat(newLog);

          this.redisPropagatorService.emitToUser({
            event: 'newLog',
            userId: userId,
            data: { log: newLog, executionCount },
          });
        }
      });
      execStart.on('end', () => {
        resolve(output);
      });
      execStart.on('error', (err) => reject(err));
    });

    return stepOutput;
  }

  private processContainerStats(stats: Docker.ContainerStats) {
    if (!stats) {
      return null;
    }

    const memoryUsage = stats.memory_stats.usage / (1024 * 1024);

    const previousSystem = stats.precpu_stats.system_cpu_usage || 0;
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - previousSystem;

    const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;

    if (isNaN(cpuPercent) || isNaN(memoryUsage)) {
      return null;
    }

    return { memory: Number(memoryUsage.toFixed(2)), cpu: Number(cpuPercent.toFixed(2)) };
  }

  private async pullImage(image: string, version: string) {
    const pullStream = await this.docker.pull(`${image}:${version}`);
    return new Promise((res) => this.docker.modem.followProgress(pullStream, res));
  }

  private addContainerFiles(container: Docker.Container, files: { name: string; content: string }[]) {
    const pack = tar.pack();
    for (const file of files) {
      pack.entry({ name: file.name }, file.content);
    }
    pack.finalize();
    return container.putArchive(pack, { path: '/app' });
  }

  private async getTimeResults(container: Docker.Container, fileName: string) {
    const exec = await container.exec({
      Cmd: ['cat', fileName],
      AttachStdout: true,
      AttachStderr: true,
    });

    const execStart = await exec.start({});
    const fileData = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      execStart.on('data', (data: Buffer) => {
        chunks.push(data);
      });
      execStart.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'));
      });
      execStart.on('error', (err: any) => reject(err));
    });

    const regexStart = /Start:\s+(\d+)/;
    const regexEnd = /End:\s+(\d+)/;

    const startTimeMatch = fileData.match(regexStart);
    const endTimeMatch = fileData.match(regexEnd);

    const startTime = startTimeMatch ? parseInt(startTimeMatch[1]) : null;
    const endTime = endTimeMatch ? parseInt(endTimeMatch[1]) : null;

    return { startTime, endTime, totalTime: endTime - startTime || null };
  }

  private computeMaxStats(statsData: any[]): { maxCPU: number; maxMemory: number } {
    const maxCPU = statsData.reduce((max, currentValue) => {
      return currentValue.cpu > max ? currentValue.cpu : max;
    }, 0);

    const maxMemory = statsData.reduce((max, currentValue) => {
      return currentValue.memory > max ? currentValue.memory : max;
    }, 0);

    return { maxCPU, maxMemory };
  }
}
