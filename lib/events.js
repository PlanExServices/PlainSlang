// In-process event bus + SSE client registry.
// Every mutation (CRUD, verify, radar) emits here; /api/stream fans out to
// connected browsers. A Postgres LISTEN bridge (see db.js) also feeds this bus
// so edits made directly in the Supabase dashboard propagate too.

const globalBus = globalThis.__plainslangBus || (globalThis.__plainslangBus = {
  clients: new Set(), // Set<WritableStreamDefaultWriter-like { send(str) }>
  lastEventId: 0,
});

export function addClient(client) {
  globalBus.clients.add(client);
  return () => globalBus.clients.delete(client);
}

export function clientCount() {
  return globalBus.clients.size;
}

export function emitEvent(type, payload = {}) {
  const id = ++globalBus.lastEventId;
  const data = JSON.stringify({ type, at: new Date().toISOString(), ...payload });
  for (const client of [...globalBus.clients]) {
    try {
      client.send(`id: ${id}\nevent: ${type}\ndata: ${data}\n\n`);
    } catch {
      globalBus.clients.delete(client);
    }
  }
}
