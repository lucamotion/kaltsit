const ids = new Set<string>();

function generateHexString(size: number) {
  return [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

export function generateCommandId() {
  let hex = generateHexString(16);

  while (ids.has(hex)) {
    hex = generateHexString(16);
  }

  ids.add(hex);
  return hex;
}
