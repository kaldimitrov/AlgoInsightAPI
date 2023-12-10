export function getDockerSocketPath() {
  const os = process.platform;

  switch (os) {
    case 'win32':
      return '\\\\.\\pipe\\docker_engine';
    case 'darwin':
      return '/var/run/docker.sock';
    default:
      return '/var/run/docker.sock';
  }
}

export function getLogLevel(level: number) {
  switch (level) {
    case 0:
      return 'INPUT';
    case 1:
      return 'INFO';
    case 2:
      return 'ERROR';
  }
}
