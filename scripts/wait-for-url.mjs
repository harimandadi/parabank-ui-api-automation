// Waits until a URL answers with HTTP 200 (e.g. ParaBank's Tomcat finished starting).
// Usage: node scripts/wait-for-url.mjs <url> [timeoutSeconds=120]
const [url, timeoutArg = '120'] = process.argv.slice(2);
if (!url) {
  console.error('Usage: node scripts/wait-for-url.mjs <url> [timeoutSeconds]');
  process.exit(2);
}

const deadline = Date.now() + Number(timeoutArg) * 1000;
process.stdout.write(`Waiting for ${url} `);

while (Date.now() < deadline) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log(' ready.');
      process.exit(0);
    }
  } catch {
    // not up yet
  }
  process.stdout.write('.');
  await new Promise((r) => setTimeout(r, 2000));
}

console.error(`\nTimed out after ${timeoutArg}s waiting for ${url}`);
process.exit(1);
