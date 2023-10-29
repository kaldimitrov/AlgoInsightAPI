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
