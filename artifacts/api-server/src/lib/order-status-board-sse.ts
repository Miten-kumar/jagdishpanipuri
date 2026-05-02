import type { Response } from "express";

type Client = {
  res: Response;
  pingTimer: NodeJS.Timeout;
};

const clients = new Set<Client>();

function writeEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function addOrderStatusBoardClient(res: Response): () => void {
  const pingTimer = setInterval(() => {
    // Keep-alive comment (helps avoid idle proxy timeouts).
    res.write(`: ping\n\n`);
  }, 25_000);

  const client: Client = { res, pingTimer };
  clients.add(client);

  writeEvent(res, "connected", { ok: true });

  return () => {
    clearInterval(pingTimer);
    clients.delete(client);
  };
}

export function broadcastOrderStatusBoardRefresh(): void {
  for (const client of clients) {
    try {
      writeEvent(client.res, "refresh", { ts: Date.now() });
    } catch {
      // If a write fails, the connection is likely closed; cleanup happens on "close".
    }
  }
}

