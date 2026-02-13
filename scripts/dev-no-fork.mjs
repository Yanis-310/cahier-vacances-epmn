import { createServer } from "node:http";
import next from "next";

const dev = true;
const hostname = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);

async function main() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  createServer((req, res) => handle(req, res)).listen(port, hostname, () => {
    // Keep output similar to Next logs for easier debugging.
    console.log(`> Ready on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error("Failed to start local server:", error);
  process.exit(1);
});
