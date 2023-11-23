import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import { Container } from './models/container.model';
import { getFileContent } from 'src/helpers/FileHelper';
import { ExecStep } from './models/execStep.model';
import { getDockerSocketPath } from 'src/helpers/OsHelper';

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);
  private readonly docker = new Docker({ socketPath: getDockerSocketPath() });

  async execute(code: string, containerSettings: Container) {
    let container: Docker.Container;
    try {
      const pullStream = await this.docker.pull(`${containerSettings.image}:${containerSettings.version}`);
      await new Promise((res) => this.docker.modem.followProgress(pullStream, res));

      container = await this.docker.createContainer({
        Image: `${containerSettings.image}:${containerSettings.version}`,
        Tty: true,
        name: 'NodeJs',
        WorkingDir: '/app',
        NetworkDisabled: true,
        HostConfig: {
          AutoRemove: true,
          NetworkMode: 'none',
        },
      });

      await container.start();

      const bashScript = getFileContent(`${__dirname}/templates/start.sh`);

      const pack = tar.pack();
      pack.entry({ name: containerSettings.fileName }, code);
      pack.entry({ name: 'start.sh' }, bashScript);
      pack.finalize();
      await container.putArchive(pack, { path: '/app' });
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
      let time: number;
      for (const execStep of containerSettings.execution) {
        const data = await this.execStep(container, execStep);
        if (execStep.log && data) {
          output.push(data);
        }
      }

      const maxCPU = statsData.reduce((max, currentValue) => {
        return currentValue.cpu > max ? currentValue.cpu : max;
      }, -Infinity);

      const maxMemory = statsData.reduce((max, currentValue) => {
        return currentValue.memory > max ? currentValue.memory : max;
      }, -Infinity);

      container.wait();
      return { time, output, statsData, maxCPU, maxMemory };
    } catch (error) {
      this.logger.error('Error running docker', error);
      throw error;
    } finally {
      if (!container) {
        return;
      }

      container.remove({ force: true }, (error) => {
        this.logger.error('Error removing container' + error.message);
      });
    }
  }

  async execStep(container: Docker.Container, execStep: ExecStep) {
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

  processContainerStats(stats: Docker.ContainerStats) {
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
}
