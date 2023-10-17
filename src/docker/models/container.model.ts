export class Container {
  image: string;
  version?: string = 'latest';
  startCmd: string;
  params: string[];
  fileName: string;

  constructor(partial: Partial<Container>) {
    Object.assign(this, partial);
  }
}
