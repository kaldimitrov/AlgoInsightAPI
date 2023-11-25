import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import { Container } from './models/container.model';
import { getFileContent } from 'src/helpers/FileHelper';
import { ExecStep } from './models/execStep.model';
import { getDockerSocketPath } from 'src/helpers/OsHelper';
import { REDIS } from 'src/redis/redis.constants';
import { RedisClient } from 'src/redis/redis.providers';
import { MAX_USER_CONTAINERS } from './constants';
import { TRANSLATIONS } from 'src/config/translations';

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);
  private readonly docker = new Docker({ socketPath: getDockerSocketPath() });

  constructor(@Inject(REDIS) private readonly redisClient: RedisClient) {}

  async execute(code: string, containerSettings: Container, userId: number) {
    let container: Docker.Container;

    await this.redisClient.hincrby('activeContainers', String(userId), 1);
    const activeUserContainers = Number(await this.redisClient.hget('activeContainers', String(userId)));
    if (activeUserContainers > MAX_USER_CONTAINERS) {
      throw new BadRequestException(TRANSLATIONS.errors.execution.active_containers_limit);
    }

    try {
      await this.pullImage(containerSettings.image, containerSettings.version);
      container = await this.docker.createContainer({
        Image: `${containerSettings.image}:${containerSettings.version}`,
        Tty: true,
        name: `container-${userId}-${activeUserContainers}`,
        WorkingDir: '/app',
        NetworkDisabled: true,
        HostConfig: {
          AutoRemove: true,
          NetworkMode: 'none',
        },
      });

      await container.start();

      await this.addContainerFiles(container, [
        { name: 'bash.sh', content: getFileContent(`${__dirname}/templates/bash.sh`) },
        { name: containerSettings.fileName, content: code },
      ]);

      const statsStream = await container.stats({ stream: true });

      const statsData = [];
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
      container.wait();

      const usageData = this.computeMaxStats(statsData);
      const timeData = await this.getTimeResults(container, 'time.txt');

      return { ...timeData, ...usageData, statsData, output };
    } catch (error) {
      this.logger.error('Error running docker', error);
      throw error;
    } finally {
      await this.redisClient.hset('activeContainers', String(userId), Math.max(0, activeUserContainers - 1));
      if (!container) {
        return;
      }

      container.remove({ force: true }, (error) => {
        if (error) {
          this.logger.error('Error removing container' + error.message);
        }
      });
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
    }, -Infinity);

    const maxMemory = statsData.reduce((max, currentValue) => {
      return currentValue.memory > max ? currentValue.memory : max;
    }, -Infinity);

    return { maxCPU, maxMemory };
  }
}
