async function sendMessage(
  anthropic: any,
  model: string,
  messages: unknown[],
  signal: AbortSignal,
) {
  return anthropic.beta.messages.create(
    {
      model,
      messages,
      max_tokens: 1024,
      stream: true,
    },
    {
      signal,
    },
  )
}
