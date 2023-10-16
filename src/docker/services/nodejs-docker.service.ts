import { Injectable, Logger } from '@nestjs/common';

import * as Docker from 'dockerode';
import * as tar from 'tar-stream';

@Injectable()
export class NodeJsDockerService {
  private readonly logger = new Logger(NodeJsDockerService.name);
  private readonly docker = new Docker({ socketPath: '\\\\.\\pipe\\docker_engine' });

  async execute(code: string) {
    let container: Docker.Container;
    try {
      container = await this.docker.createContainer({
        Image: 'node:latest',
        Tty: true,
        name: 'NodeJs',
        WorkingDir: '/app',
      });

      await container.start();

      const pack = tar.pack();
      pack.entry({ name: 'index.js' }, code);
      pack.finalize();

      const destPath = '/app';

      await container.putArchive(pack, { path: destPath });

      const exec = await container.exec({
        Cmd: ['node', destPath],
        AttachStdout: true,
        AttachStderr: true,
      });

      const execStart = exec.start({});

      const output = await new Promise(async (resolve, reject) => {
        const chunks = [];
        (await execStart).on('data', (data) => {
          chunks.push(data.slice(8));
        });
        (await execStart).on('end', () => {
          resolve(Buffer.concat(chunks).toString('utf-8'));
        });
        (await execStart).on('error', (err) => reject(err));
      });

      return output;
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
