import { Injectable, Logger } from '@nestjs/common';

import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import { Container } from './models/container.model';
import { Duplex } from 'stream';

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);
  private readonly docker = new Docker({ socketPath: '\\\\.\\pipe\\docker_engine' });

  async execute(code: string, containerSettings: Container) {
    let container: Docker.Container;
    try {
      container = await this.docker.createContainer({
        Image: `${containerSettings.image}:${containerSettings.version}`,
        Tty: true,
        name: 'NodeJs',
        WorkingDir: '/app',
      });

      await container.start();

      const pack = tar.pack();
      pack.entry({ name: containerSettings.fileName }, code);
      pack.finalize();

      const destPath = '/app';
      await container.putArchive(pack, { path: destPath });

      let execStart: Duplex;
      let time: number;
      let output: string;
      for (const execStep of containerSettings.execution) {
        const exec = await container.exec({
          Cmd: [execStep.cmd, ...execStep.params],
          AttachStdout: true,
          AttachStderr: true,
        });

        execStart = await exec.start({});
        const startTime = Date.now();
        output = await new Promise(async (resolve, reject) => {
          const chunks = [];
          execStart.on('data', (data) => {
            chunks.push(data.slice(8));
          });
          execStart.on('end', () => {
            time = Date.now() - startTime;
            resolve(Buffer.concat(chunks).toString('utf-8'));
          });
          execStart.on('error', (err) => reject(err));
        });
      }

      return { time, output };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      if (!container) {
        return;
      }

      try {
        await container.remove({ force: true });
      } catch (error) {
        console.error('Error while removing container:', error);
      }
    }
  }
}
