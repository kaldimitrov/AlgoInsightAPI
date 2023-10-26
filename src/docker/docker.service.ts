import { Injectable, Logger } from '@nestjs/common';

import * as Docker from 'dockerode';
import * as tar from 'tar-stream';
import * as fs from 'fs';
import { Container } from './models/container.model';

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);
  private readonly docker = new Docker({ socketPath: '\\\\.\\pipe\\docker_engine' });

  async execute(code: string, containerSettings: Container) {
    let container: Docker.Container;
    const pullStream = await this.docker.pull(`${containerSettings.image}:${containerSettings.version}`);
    await new Promise((res) => this.docker.modem.followProgress(pullStream, res));
    try {
      container = await this.docker.createContainer({
        Image: `${containerSettings.image}:${containerSettings.version}`,
        Tty: true,
        name: 'NodeJs',
        WorkingDir: '/app',
      });

      await container.start();

      const fileContent = this.generateFile(code, containerSettings.fileName);
      const pack = tar.pack();
      pack.entry({ name: containerSettings.fileName }, fileContent);
      pack.finalize();
      await container.putArchive(pack, { path: '/app' });

      let time: number;
      const output = [];
      for (const execStep of containerSettings.execution) {
        const exec = await container.exec({
          Cmd: [execStep.cmd, ...execStep.params],
          AttachStdout: true,
          AttachStderr: true,
        });

        const execStart = await exec.start({});
        const startTime = Date.now();

        const stepOutput = await new Promise(async (resolve, reject) => {
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

        if (execStep.log) {
          output.push(stepOutput);
        }
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

  generateFile(code: string, fileName: string) {
    try {
      const fileContent: string = fs.readFileSync(`${__dirname}/templates/${fileName}`, 'utf-8');
      return fileContent.replace('{{replacement_code}}', code);
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
  }
}
