async function fetchOnce(url: string): Promise<Response> {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 5000);

  try {
    return await fetch(url, {
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

void fetchOnce('https://api.example.com/status');
