import { BadRequestException, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import { Container } from './models/container.model';
import { getFileContent } from 'src/helpers/FileHelper';
import { ExecStep } from './models/execStep.model';
import { getDockerSocketPath } from 'src/helpers/OsHelper';
import { REDIS } from 'src/redis/redis.constants';
import { RedisClient } from 'src/redis/redis.providers';
import { MB_SIZE } from './constants';
import { TRANSLATIONS } from 'src/config/translations';
import { UserService } from 'src/user/user.service';
import { ExecutionStats } from './dto/stats.dto';
import { HistoryService } from 'src/history/history.service';
import { Languages } from './enums/languages';
import { ExecutionStatus } from 'src/history/enums/executionStatus';

@Injectable()
export class DockerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DockerService.name);
  private readonly docker = new Docker({ socketPath: getDockerSocketPath() });

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClient,
    private readonly userService: UserService,
    private readonly historyService: HistoryService,
  ) {}

  async onApplicationBootstrap() {
    const activeContainers = await this.redisClient.hgetall('activeContainers');
    if (!activeContainers || !Object.keys(activeContainers).length) {
      return;
    }

    for (const [key, value] of Object.entries(activeContainers)) {
      const containerIds = JSON.parse(value);

      containerIds.forEach(async (id: string) => {
        this.docker.getContainer(id).remove({ force: true }, (error) => {
          if (error) {
            this.logger.error(`Error removing container with id ${id} from user ${key}` + error.message);
          }
        });
      });
    }

    await this.redisClient.del('activeContainers');
  }

  async execute(code: string, containerSettings: Container, userId: number, language: Languages) {
    const user = await this.userService.findOne(userId);

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
          AutoRemove: true,
          NetworkMode: 'none',
        },
      });

      userContainers.push(container.id);
      await this.redisClient.hset('activeContainers', String(userId), JSON.stringify(userContainers));
      await container.start();

      await this.addContainerFiles(container, [
        { name: 'bash.sh', content: getFileContent(`${__dirname}/templates/bash.sh`) },
        { name: containerSettings.fileName, content: code },
      ]);

      const statsStream = await container.stats({ stream: true });

      const statsData: ExecutionStats[] = [];
      statsStream.on('data', (data) => {
        const time = Date.now();
        const processedData = this.processContainerStats(JSON.parse(data.toString('utf-8').replace(/\n/g, '')));

        if (processedData) {
          statsData.push({ time, cpu: processedData.cpu, memory: processedData.memory });
        }
      });

      const output = [];
      for (const execStep of containerSettings.execution) {
        const data = await this.execStep(container, execStep);
        if (execStep.log && data) {
          output.push(data);
        }
      }

      const usageData = this.computeMaxStats(statsData);
      const timeData = await this.getTimeResults(container, 'time.txt');

      return this.historyService.updateHistoryProperties(history.id, {
        status: ExecutionStatus.SUCCESS,
        execution_time: timeData.totalTime,
        start_time: timeData.startTime,
        end_time: timeData.endTime,
        stats: statsData,
        max_cpu: usageData.maxCPU,
        max_memory: usageData.maxMemory,
        logs: String(output),
      });
    } catch (error) {
      await this.historyService.updateHistoryProperties(history.id, { status: ExecutionStatus.ERRORED });
      this.logger.error('Error running docker', error);
      throw error;
    } finally {
      if (!container) {
        return;
      }

      container.remove({ force: true }, (error) => {
        if (error) {
          this.logger.error(`Error removing container with id ${container.id}` + error.message);
        }
      });

      userContainers = JSON.parse(await this.redisClient.hget('activeContainers', String(userId))) || [];
      await this.redisClient.hset(
        'activeContainers',
        String(userId),
        JSON.stringify(userContainers.filter((contId) => contId != container.id)),
      );
    }
  }

  private async execStep(container: Docker.Container, execStep: ExecStep) {
    const exec = await container.exec({
      Cmd: [execStep.cmd, ...execStep.params],
      AttachStdout: true,
      AttachStderr: true,
    });

    const execStart = await exec.start({});
    const stepOutput = await new Promise((resolve, reject) => {
      const chunks = [];
      execStart.on('data', (data) => {
        chunks.push(data.slice(8));
      });
      execStart.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'));
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

    return { startTime, endTime, totalTime: endTime - startTime };
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
