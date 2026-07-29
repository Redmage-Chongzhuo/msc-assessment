export type CallCategory =
  | 'http'
  | 'llm'
  | 'mcp'
  | 'subprocess'

export type Finding = {
  file: string
  line: number
  column: number
  category: CallCategory
  call: string
  arguments: string[]
  context: {
    insideLoop: boolean
    insidePromiseAll: boolean
  }
  controls: {
    abortSignal: boolean
    timeoutMs?: number
  }
}

export type ScanSummary = {
  filesScanned: number
  findingsFound: number
  findingsByCategory: Record<CallCategory, number>
}

export type ScanReport = {
  scannedPath: string
  generatedAt: string
  summary: ScanSummary
  findings: Finding[]
}
