#!/usr/bin/env node
import { runPrompts } from '../lib/prompts.js';

async function main() {
  try {
    await runPrompts();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

