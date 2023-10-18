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
  haskell: {
    image: 'haskell',
    fileName: 'main.hs',
    execution: [
      {
        cmd: 'ghc',
        params: ['main.hs', '-o', 'out.exe'],
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
  elixir: {
    image: 'elixir',
    fileName: 'main.exs',
    execution: [
      {
        cmd: 'elixir',
        params: ['main.exs'],
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
  dart: {
    image: 'dart',
    fileName: 'main.dart',
    execution: [
      {
        cmd: 'dart',
        params: ['run', 'main.dart'],
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
      },
    ],
  },
};
