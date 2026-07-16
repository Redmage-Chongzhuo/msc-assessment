type AgentTask = {
  prompt: string;
};

async function runAgent(task: AgentTask): Promise<string> {
  return task.prompt;
}

async function analyseInParallel(): Promise<string[]> {
  const tasks: AgentTask[] = [
    { prompt: 'Analyse polling loops' },
    { prompt: 'Analyse LLM retries' },
    { prompt: 'Analyse subprocess usage' }
  ];

  return Promise.all(
    tasks.map(task => runAgent(task))
  );
}

void analyseInParallel();
