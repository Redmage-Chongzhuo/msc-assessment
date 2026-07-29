import { spawn } from 'node:child_process'

const child = spawn('python3', ['script.py'], {
  cwd: '/tmp',
  detached: false,
})

child.on('exit', () => {})
