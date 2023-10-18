export const containers = {
  node: {
    image: 'node',
    fileName: 'index.js',
    execution: [
      {
        cmd: 'node',
        params: ['index.js'],
        log: true,
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
        log: true,
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
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['777', './out.exe'],
        log: false,
      },
      {
        cmd: './out.exe',
        params: [],
        log: true,
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
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['777', './out.exe'],
        log: false,
      },
      {
        cmd: './out.exe',
        params: [],
        log: true,
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
        log: true,
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
        log: true,
      },
      {
        cmd: 'java',
        params: ['Main'],
        log: true,
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
        log: true,
      },
      {
        cmd: './main',
        params: [],
        log: true,
      },
    ],
  },
  haskell: {
    image: 'haskell',
    fileName: 'main.hs',
    execution: [
      {
        cmd: 'ghc',
        params: ['main.hs', '-o', 'out.exe'],
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['777', './out.exe'],
        log: false,
      },
      {
        cmd: './out.exe',
        params: [],
        log: true,
      },
    ],
  },
  elixir: {
    image: 'elixir',
    fileName: 'main.exs',
    execution: [
      {
        cmd: 'elixir',
        params: ['main.exs'],
        log: true,
      },
    ],
  },
  golang: {
    image: 'golang',
    fileName: 'main.go',
    execution: [
      {
        cmd: 'go',
        params: ['run', 'main.go'],
        log: true,
      },
    ],
  },
  swift: {
    image: 'swift',
    fileName: 'main.swift',
    execution: [
      {
        cmd: 'swiftc',
        params: ['main.swift', '-o', 'out.exe'],
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['777', './out.exe'],
        log: false,
      },
      {
        cmd: './out.exe',
        params: [],
        log: true,
      },
    ],
  },
  dart: {
    image: 'dart',
    fileName: 'main.dart',
    execution: [
      {
        cmd: 'dart',
        params: ['run', 'main.dart'],
        log: true,
      },
    ],
  },
  perl: {
    image: 'perl',
    fileName: 'main.pl',
    execution: [
      {
        cmd: 'perl',
        params: ['main.pl'],
        log: true,
      },
    ],
  },
};
