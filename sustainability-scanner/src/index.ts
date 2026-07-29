import path from 'node:path'
import process from 'node:process'
import {
  Node,
  Project,
  SyntaxKind,
  type CallExpression,
} from 'ts-morph'
import { classifyCall } from './detectors/callClassifier.js'
import type { Finding } from './types.js'

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

function main(): void {
  const inputPath = process.argv[2]

  if (!inputPath) {
    console.error('Usage: npm run dev -- <typescript-file>')
    process.exitCode = 1
    return
  }

  const absolutePath = path.resolve(inputPath)

  const project = new Project({
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
  })

  const sourceFile = project.addSourceFileAtPathIfExists(absolutePath)

  if (!sourceFile) {
    console.error(`File not found: ${absolutePath}`)
    process.exitCode = 1
    return
  }

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

  console.log(JSON.stringify(findings, null, 2))
}

main()
