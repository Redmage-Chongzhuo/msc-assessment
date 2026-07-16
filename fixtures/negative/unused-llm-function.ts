type ModelResponse = {
  text: string;
};

async function callModel(prompt: string): Promise<ModelResponse> {
  return {
    text: prompt
  };
}

async function unusedFallback(): Promise<ModelResponse> {
  return callModel('This function is never called');
}

export const fixtureName = 'unused-llm-function';
