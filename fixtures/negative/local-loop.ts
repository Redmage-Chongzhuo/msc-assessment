type Item = {
  value: number;
};

function sumValues(items: Item[]): number {
  let total = 0;

  for (const item of items) {
    total += item.value;
  }

  return total;
}

console.log(sumValues([
  { value: 1 },
  { value: 2 },
  { value: 3 }
]));
