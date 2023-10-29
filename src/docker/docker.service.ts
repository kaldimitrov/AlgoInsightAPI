import { Injectable, Logger } from '@nestjs/common';

import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import { Container } from './models/container.model';
import { CODE_PLACEHOLDER_NAME } from './constants';
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
      });

      await container.start();

      const fileContent = getFileContent(
        `${__dirname}/templates/${containerSettings.fileName}`,
        CODE_PLACEHOLDER_NAME,
        code,
      );

      const pack = tar.pack();
      pack.entry({ name: containerSettings.fileName }, fileContent);
      pack.finalize();
      await container.putArchive(pack, { path: '/app' });

      let time: number;
      const output = await Promise.all(
        containerSettings.execution.map((execStep) => this.execStep(container, execStep)),
      );

      return { time, output };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      if (!container) {
        return;
      }

      container.remove({ force: true }, (error) => {
        if (error) {
          console.error('Error while removing container:', error);
        }
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

    if (execStep.log) {
      return stepOutput;
    }
  }
}
