import { addClient, clientCount } from '@/lib/events';
import { ensureReady } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Server-Sent Events: browsers connect here and receive live updates
// (term-created/updated/deleted, trending-updated, radar-updated, db-change).
export async function GET() {
  await ensureReady().catch(() => {}); // start LISTEN bridge; stream works regardless

  const encoder = new TextEncoder();
  let removeClient = () => {};
  let heartbeat;

  const stream = new ReadableStream({
    start(controller) {
      const client = {
        send(str) {
          controller.enqueue(encoder.encode(str));
        },
      };
      removeClient = addClient(client);
      client.send(`event: hello\ndata: {"connected":true,"clients":${clientCount()}}\n\n`);
      // keep proxies (Render/Cloudflare) from idling the connection out
      heartbeat = setInterval(() => {
        try {
          client.send(`: ping ${Date.now()}\n\n`);
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);
    },
    cancel() {
      clearInterval(heartbeat);
      removeClient();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
