function* createIntGenerator(): Generator<number, number, void> {
  let index = 0;

  while (true) {
    /* istanbul ignore next */
    if (index < Number.MAX_SAFE_INTEGER) yield ++index;
    else index = 0;
  }
}

const intGenerator = createIntGenerator();

/**
 * Get an integer ID for attaching to a JSON RPC request payload.
 */
export function getPayloadId(): number {
  return intGenerator.next().value;
}
