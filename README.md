# sustainability-scanner

A command-line tool that scans a TypeScript codebase and reports where it calls external LLM APIs, MCP tools, HTTP requests, and subprocesses.

## Install

```bash
cd sustainability-scanner
npm install
npm run build
npm link
```

This registers `sustainability-scanner` as a global command on this machine. Besides this, the package can also be built into a `.tgz` file with `npm pack` if it needs to be shared with someone else.

## Usage

```bash
sustainability-scanner <file-or-directory-path>
```

Pass a single file to scan just that file, or a directory to scan it recursively (`node_modules`, `dist`, `build`, and `.git` are skipped automatically). The result is printed to the terminal as JSON.

### Examples

```bash
# Scan one file
sustainability-scanner path/to/file.ts

# Scan a whole project, save the output
sustainability-scanner path/to/claude-code > scan-result.json

# Scan and only look at the summary
sustainability-scanner path/to/claude-code | node -e \
  "const r=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(JSON.stringify(r.summary, null, 2))"
```

It is worthy of remark that `npm run dev -- <path>` does the same thing without building or linking first, which is more convenient during development.

## Output

```jsonc
{
  "scannedPath": "...",
  "generatedAt": "...",
  "summary": {
    "filesScanned": 2008,
    "findingsFound": 218,
    "findingsByCategory": { "http": 111, "llm": 17, "mcp": 2, "subprocess": 78, "agent": 10 }
  },
  "findings": [
    {
      "file": "...", "line": 1822, "column": 12,
      "category": "llm",
      "call": "anthropic.beta.messages.create",
      "arguments": ["..."],
      "context": { "insideLoop": false, "insidePromiseAll": false },
      "controls": { "abortSignal": true }
    }
  ]
}
```

`category` is one of `http`, `llm`, `mcp`, `subprocess`, or `agent`. `context` and `controls` show whether the call sits inside a loop or `Promise.all`, and whether it has an `AbortSignal`.
