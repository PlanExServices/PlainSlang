'use client';

import { useEffect, useRef, useState } from 'react';

// Live refresh with automatic transport selection:
//   1. asks /api/realtime-config which transport the deployment supports
//   2. 'sse'      → EventSource on /api/stream (Node runtimes)
//   3. 'supabase' → Supabase Realtime WebSocket, postgres_changes on `terms`
//      and `meta` (Cloudflare Workers deployments — no server SSE needed)
// Calls onEvent (debounced) on every change. Returns 'live'|'connecting'|'off'.
export function useLiveRefresh(onEvent, { debounceMs = 400 } = {}) {
  const [status, setStatus] = useState('connecting');
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    if (typeof window === 'undefined') {
      setStatus('off');
      return;
    }
    let es;
    let channel;
    let sbClient;
    let debounce;
    let retry;
    let closed = false;

    const fire = (type, data) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => cbRef.current && cbRef.current(type, data), debounceMs);
    };

    const connectSSE = () => {
      if (closed || !('EventSource' in window)) {
        setStatus('off');
        return;
      }
      es = new EventSource('/api/stream');
      es.addEventListener('hello', () => setStatus('live'));
      for (const type of ['term-created', 'term-updated', 'term-deleted', 'trending-updated', 'radar-updated', 'db-change']) {
        es.addEventListener(type, (e) => {
          let data = {};
          try { data = JSON.parse(e.data); } catch { /* ignore */ }
          fire(type, data);
        });
      }
      es.onerror = () => {
        setStatus('connecting');
        es.close();
        retry = setTimeout(connectSSE, 3000 + Math.random() * 2000);
      };
    };

    const connectSupabase = async (cfg) => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (closed) return;
        sbClient = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false } });
        channel = sbClient
          .channel('plainslang-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'terms' }, (payload) => {
            fire('db-change', { op: payload.eventType, id: payload.new?.id ?? payload.old?.id });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'meta' }, (payload) => {
            const key = payload.new?.key ?? payload.old?.key;
            if (key === 'trending_status') fire('trending-updated', {});
            else if (key === 'radar_status') fire('radar-updated', {});
          })
          .subscribe((state) => {
            if (state === 'SUBSCRIBED') setStatus('live');
            else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') setStatus('connecting');
          });
      } catch {
        setStatus('off');
      }
    };

    fetch('/api/realtime-config', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { transport: 'sse' }))
      .then((cfg) => {
        if (closed) return;
        if (cfg.transport === 'supabase' && cfg.url && cfg.anonKey) connectSupabase(cfg);
        else connectSSE();
      })
      .catch(() => connectSSE());

    return () => {
      closed = true;
      clearTimeout(debounce);
      clearTimeout(retry);
      if (es) es.close();
      if (channel && sbClient) sbClient.removeChannel(channel);
    };
  }, [debounceMs]);

  return status;
}
