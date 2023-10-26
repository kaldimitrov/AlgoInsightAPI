export class Container {
  image: string;
  version?: string = 'latest';
  fileName: string;
  execution?: { cmd: string; params: string[]; log: boolean }[] = [];

  constructor(partial: Partial<Container>) {
    Object.assign(this, partial);
  }
}
