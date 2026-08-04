import process from 'node:process'
import { scanPath } from './scanner.js'

function main(): void {
  const inputPath = process.argv[2]
  if (!inputPath) {
    console.error('Usage: npm run dev -- <typescript-file-or-directory>')
    process.exitCode = 1
    return
  }

  const report = scanPath(inputPath)
  console.log(JSON.stringify(report, null, 2))
}

main()
