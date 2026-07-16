type SideQueryOptions = {
  prompt: string;
  maxTokens: number;
  abortSignal?: AbortSignal;
};

async function sideQuery(options: SideQueryOptions): Promise<string> {
  return options.prompt;
}

async function classifyRepository(
  sourceCode: string,
  abortSignal: AbortSignal
): Promise<string> {
  const classification = await sideQuery({
    prompt: `Classify the sustainability risk:\n${sourceCode}`,
    maxTokens: 64,
    abortSignal
  });

  return classification;
}

const controller = new AbortController();
void classifyRepository('while (true) { await fetch(url); }', controller.signal);
