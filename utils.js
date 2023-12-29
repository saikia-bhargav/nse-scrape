function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function* asyncIteratorWithDelay(items, delayMs) {
  for (const item of items) {
    yield item;
    await delay(delayMs);
  }
}

module.exports = asyncIteratorWithDelay;