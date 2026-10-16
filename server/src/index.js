import { start } from './relay.js';
const relay = await start();
console.log(`HAPIL relay listening on port ${relay.server.address().port}`);
let stopping = false;
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, async () => {
  if (stopping) return;
  stopping = true;
  await relay.close();
});
