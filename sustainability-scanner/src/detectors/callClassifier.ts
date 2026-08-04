import type { CallExpression } from 'ts-morph'
import type { CallCategory } from '../types.js'

// Verified wrapper whitelist.
// Each entry corresponds to a wrapper function/method name confirmed against
// real call chains documented in analysis-results/. These are NOT guessed by
// name pattern — each has a citation to the report that verified it.
const VERIFIED_WRAPPERS: Record<string, CallCategory> = {
  // analysis-results/llm-api-call-sites-findings.txt, llm-retry-findings.txt,
  // tool-use-agent-loop-findings.txt: deps.callModel(...) -> queryModelWithStreaming
  callModel: 'llm',
  // analysis-results/side-query-findings.txt: sideQuery() is a shared wrapper
  // for non-streaming auxiliary LLM requests
  sideQuery: 'llm',
  // analysis-results/subagent-concurrency-findings.txt: src/tools/AgentTool/runAgent.ts,
  // each Subagent independently runs runAgent()
  runAgent: 'agent',
}

function matchesWrapper(expression: string, name: string): boolean {
  return expression === name || expression.endsWith(`.${name}`)
}

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

  // Exclude RegExp.exec() (e.g. /pattern/.exec or someRegex.exec), which is
  // unrelated to subprocess execution and was previously misclassified.
  const isRegexExec = /^\/.*\/[a-z]*\.exec$/.test(expression)

  if (
    !isRegexExec &&
    (
      expression === 'spawn' ||
      expression === 'exec' ||
      expression === 'execFile' ||
      expression.endsWith('.spawn') ||
      expression.endsWith('.exec')
    )
  ) {
    return 'subprocess'
  }

  for (const [name, category] of Object.entries(VERIFIED_WRAPPERS)) {
    if (matchesWrapper(expression, name)) {
      return category
    }
  }

  return undefined
}
