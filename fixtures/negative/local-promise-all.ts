async function doubleValue(value: number): Promise<number> {
  return value * 2;
}

async function processLocally(): Promise<number[]> {
  const values = [1, 2, 3];

  return Promise.all(
    values.map(value => doubleValue(value))
  );
}

void processLocally();
