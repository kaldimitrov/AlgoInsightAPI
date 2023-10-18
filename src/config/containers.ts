export const containers = {
  node: {
    image: 'node',
    fileName: 'index.js',
    execution: [
      {
        cmd: 'node',
        params: ['index.js'],
      },
    ],
  },
  python: {
    image: 'python',
    fileName: 'main.py',
    execution: [
      {
        cmd: 'python3',
        params: ['main.py'],
      },
    ],
  },
  c: {
    image: 'gcc',
    fileName: 'main.c',
    execution: [
      {
        cmd: 'gcc',
        params: ['main.c', '-o', 'out.exe'],
      },
      {
        cmd: 'chmod',
        params: ['777', './out.exe'],
      },
      {
        cmd: './out.exe',
        params: [],
      },
    ],
  },
  cpp: {
    image: 'gcc',
    fileName: 'main.cpp',
    execution: [
      {
        cmd: 'g++',
        params: ['main.cpp', '-o', 'out.exe'],
      },
      {
        cmd: 'chmod',
        params: ['777', './out.exe'],
      },
      {
        cmd: './out.exe',
        params: [],
      },
    ],
  },
  ruby: {
    image: 'ruby',
    fileName: 'main.rb',
    execution: [
      {
        cmd: 'ruby',
        params: ['main.rb'],
      },
    ],
  },
  java: {
    image: 'openjdk',
    fileName: 'Main.java',
    execution: [
      {
        cmd: 'javac',
        params: ['Main.java'],
      },
      {
        cmd: 'java',
        params: ['Main'],
      },
    ],
  },
  rust: {
    image: 'rust',
    fileName: 'main.rs',
    execution: [
      {
        cmd: 'rustc',
        params: ['main.rs'],
      },
      {
        cmd: './main',
        params: [],
      },
    ],
  },
};
