import fs from 'node:fs'
import path from 'node:path'
import {
  Node,
  Project,
  SyntaxKind,
  type CallExpression,
  type SourceFile,
} from 'ts-morph'
import { classifyCall } from './detectors/callClassifier.js'
import type { Finding, ScanReport, ScanSummary } from './types.js'

const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', '.git'])
const TS_FILE_PATTERN = /\.(ts|tsx)$/

function isInsideLoop(call: CallExpression): boolean {
  return call.getAncestors().some(
    ancestor =>
      Node.isForStatement(ancestor) ||
      Node.isForInStatement(ancestor) ||
      Node.isForOfStatement(ancestor) ||
      Node.isWhileStatement(ancestor) ||
      Node.isDoStatement(ancestor),
  )
}

function hasAbortSignal(call: CallExpression): boolean {
  return call.getArguments().some(argument => {
    if (!Node.isObjectLiteralExpression(argument)) {
      return false
    }
    return argument.getProperties().some(property => {
      if (
        Node.isPropertyAssignment(property) &&
        property.getName() === 'signal'
      ) {
        return true
      }
      return (
        Node.isShorthandPropertyAssignment(property) &&
        property.getName() === 'signal'
      )
    })
  })
}

function isInsidePromiseAll(call: CallExpression): boolean {
  return call.getAncestors().some(ancestor => {
    if (!Node.isCallExpression(ancestor)) {
      return false
    }
    return ancestor.getExpression().getText() === 'Promise.all'
  })
}

function scanSourceFile(sourceFile: SourceFile): Finding[] {
  const findings: Finding[] = []
  for (const call of sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression,
  )) {
    const category = classifyCall(call)
    if (!category) {
      continue
    }
    const location = sourceFile.getLineAndColumnAtPos(call.getStart())
    findings.push({
      file: sourceFile.getFilePath(),
      line: location.line,
      column: location.column,
      category,
      call: call.getExpression().getText(),
      arguments: call.getArguments().map(argument => argument.getText()),
      context: {
        insideLoop: isInsideLoop(call),
        insidePromiseAll: isInsidePromiseAll(call),
      },
      controls: {
        abortSignal: hasAbortSignal(call),
      },
    })
  }
  return findings
}

function collectTsFiles(rootPath: string): string[] {
  const stat = fs.statSync(rootPath)
  if (stat.isFile()) {
    return TS_FILE_PATTERN.test(rootPath) ? [rootPath] : []
  }
  const results: string[] = []
  for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue
    }
    const fullPath = path.join(rootPath, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(fullPath))
    } else if (TS_FILE_PATTERN.test(entry.name)) {
      results.push(fullPath)
    }
  }
  return results
}

function emptySummary(): ScanSummary {
  return {
    filesScanned: 0,
    findingsFound: 0,
    findingsByCategory: {
      http: 0,
      llm: 0,
      mcp: 0,
      subprocess: 0,
      agent: 0,
    },
  }
}

export function scanPath(inputPath: string): ScanReport {
  const absolutePath = path.resolve(inputPath)
  const files = collectTsFiles(absolutePath)

  const project = new Project({
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
  })

  const findings: Finding[] = []
  for (const filePath of files) {
    const sourceFile = project.addSourceFileAtPathIfExists(filePath)
    if (!sourceFile) {
      continue
    }
    findings.push(...scanSourceFile(sourceFile))
  }

  const summary = emptySummary()
  summary.filesScanned = files.length
  summary.findingsFound = findings.length
  for (const finding of findings) {
    summary.findingsByCategory[finding.category] += 1
  }

  return {
    scannedPath: absolutePath,
    generatedAt: new Date().toISOString(),
    summary,
    findings,
  }
}
