type ModelResponse = {
  text: string;
};

async function callModel(prompt: string): Promise<ModelResponse> {
  return {
    text: prompt
  };
}

async function generateWithRetry(prompt: string): Promise<ModelResponse> {
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callModel(prompt);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise(resolve =>
        setTimeout(resolve, 2 ** attempt * 1000)
      );
    }
  }

  throw new Error('Unreachable');
}

void generateWithRetry('Summarise this project');
