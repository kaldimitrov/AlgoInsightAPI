import { ExecStep } from './execStep.model';

export class Container {
  image: string;
  version?: string = 'latest';
  fileName: string;
  execution?: ExecStep[] = [];

  constructor(partial: Partial<Container>) {
    Object.assign(this, partial);
  }
}
