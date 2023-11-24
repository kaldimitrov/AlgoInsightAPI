export const containers = {
  node: {
    image: 'node',
    fileName: 'index.js',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['node', 'index.js'],
        log: true,
      },
    ],
  },
  python: {
    image: 'python',
    fileName: 'main.py',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['python3', 'main.py'],
        log: true,
      },
    ],
  },
  c: {
    image: 'gcc',
    fileName: 'main.c',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: 'gcc',
        params: ['main.c', '-o', 'out.exe'],
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['+x', './out.exe'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['./out.exe'],
        log: true,
      },
    ],
  },
  cpp: {
    image: 'gcc',
    fileName: 'main.cpp',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: 'g++',
        params: ['main.cpp', '-o', 'out.exe'],
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['+x', './out.exe'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['./out.exe'],
        log: true,
      },
    ],
  },
  ruby: {
    image: 'ruby',
    fileName: 'main.rb',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['ruby', 'main.rb'],
        log: true,
      },
    ],
  },
  java: {
    image: 'openjdk',
    fileName: 'Main.java',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: 'javac',
        params: ['Main.java'],
        log: true,
      },
      {
        cmd: './bash.sh',
        params: ['java', 'Main'],
        log: true,
      },
    ],
  },
  rust: {
    image: 'rust',
    fileName: 'main.rs',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: 'rustc',
        params: ['main.rs'],
        log: true,
      },
      {
        cmd: './bash.sh',
        params: ['./main'],
        log: true,
      },
    ],
  },
  haskell: {
    image: 'haskell',
    fileName: 'main.hs',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: 'ghc',
        params: ['main.hs', '-o', 'out.exe'],
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['+x', './out.exe'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['./out.exe'],
        log: true,
      },
    ],
  },
  elixir: {
    image: 'elixir',
    fileName: 'main.exs',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['elixir', 'main.exs'],
        log: true,
      },
    ],
  },
  golang: {
    image: 'golang',
    fileName: 'main.go',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['go', 'run', 'main.go'],
        log: true,
      },
    ],
  },
  swift: {
    image: 'swift',
    fileName: 'main.swift',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: 'swiftc',
        params: ['main.swift', '-o', 'out.exe'],
        log: true,
      },
      {
        cmd: 'chmod',
        params: ['+x', './out.exe'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['./out.exe'],
        log: true,
      },
    ],
  },
  dart: {
    image: 'dart',
    fileName: 'main.dart',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['dart', 'run', 'main.dart'],
        log: true,
      },
    ],
  },
  perl: {
    image: 'perl',
    fileName: 'main.pl',
    execution: [
      {
        cmd: 'chmod',
        params: ['+x', 'bash.sh'],
        log: false,
      },
      {
        cmd: './bash.sh',
        params: ['perl', 'main.pl'],
        log: true,
      },
    ],
  },
};
