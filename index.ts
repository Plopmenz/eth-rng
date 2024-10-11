import { createPublicClient, http } from "viem";
import { writeFile } from "fs/promises";

const START_BLOCK_NUMBER = BigInt(20942536);
const RPC = "https://eth.llamarpc.com" as const;

const UPPER_RANGE = 8019 - 500; // should be smaller than 2^16

async function getNumbers(amount: number, distinct: boolean): Promise<number[]> {
  const numbers: number[] = [];
  const blocknr = START_BLOCK_NUMBER;
  const publicClient = createPublicClient({
    transport: http(RPC),
  });
  while (numbers.length < amount) {
    const block = await publicClient.getBlock({ blockNumber: blocknr, includeTransactions: true });
    block.transactions.forEach((tx) => {
      const hex = tx.hash.replace("0x", ""); // 64 characters, should be padded
      for (let i = 0; i < 16; i++) {
        const number = parseInt(hex.substring(i * 4, (i + 1) * 4), 16) % UPPER_RANGE; // not a perfect distribution (early numbers are more likely)

        if (distinct && numbers.includes(number)) {
          continue;
        }

        numbers.push(number);
      }
    });
  }
  return numbers.slice(0, amount);
}

getNumbers(500, true)
  .then((rngs) => writeFile("random-numbers.txt", rngs.map((n) => n + 501).join("\n")))
  .catch(console.error);
