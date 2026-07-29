import type { CallExpression } from 'ts-morph'
import type { CallCategory } from '../types.js'

export function classifyCall(
  call: CallExpression,
): CallCategory | undefined {
  const expression = call.getExpression().getText()

  if (
    expression === 'fetch' ||
    /^axios\.(get|post|put|patch|delete|request)$/.test(expression)
  ) {
    return 'http'
  }

  if (
    expression.endsWith('.messages.create') ||
    expression.endsWith('.messages.stream')
  ) {
    return 'llm'
  }

  if (expression.endsWith('.callTool')) {
    return 'mcp'
  }

  if (
    expression === 'spawn' ||
    expression === 'exec' ||
    expression === 'execFile' ||
    expression.endsWith('.spawn') ||
    expression.endsWith('.exec')
  ) {
    return 'subprocess'
  }

  return undefined
}
