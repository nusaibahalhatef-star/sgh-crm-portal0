import { Router, Request, Response } from "express";
import { subscribe, channelForConversation, channelForUser } from "./_core/pubsub";

/** Shared SSE headers — disables proxy/Nginx buffering for real-time delivery */
const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',   // prevents Nginx from buffering the stream
};

/** Write a named SSE event safely (guards against write-after-close) */
function safeSend(res: Response, event: string, data: unknown) {
  try {
    if (!res.writableEnded) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  } catch (_) { /* ignore */ }
}

export function createWhatsAppSseRouter(): Router {
  const router = Router();

  // ── Conversation-level stream ──────────────────────────────────────────────
  router.get('/api/whatsapp/stream/:conversationId', (req: Request, res: Response) => {
    const conversationId = Number(req.params.conversationId);
    if (isNaN(conversationId)) return res.status(400).send('Invalid conversation id');

    res.set(SSE_HEADERS);
    res.flushHeaders();
    // Immediate connected event so the client knows the stream is live
    res.write('event: connected\ndata: {}\n\n');

    const send = (event: string, data: unknown) => safeSend(res, event, data);
    const unsub = subscribe(channelForConversation(conversationId), send);

    // Keep-alive comment every 15 s (shorter than most proxy 30 s idle timeouts)
    const keepAlive = setInterval(() => {
      try { if (!res.writableEnded) res.write(': ping\n\n'); } catch (_) {}
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsub();
    });
  });

  // ── User-level stream (new conversations, counts, etc.) ───────────────────
  router.get('/api/whatsapp/stream/user/:userId', (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).send('Invalid user id');

    res.set(SSE_HEADERS);
    res.flushHeaders();
    res.write('event: connected\ndata: {}\n\n');

    const send = (event: string, data: unknown) => safeSend(res, event, data);
    const unsub = subscribe(channelForUser(userId), send);

    const keepAlive = setInterval(() => {
      try { if (!res.writableEnded) res.write(': ping\n\n'); } catch (_) {}
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      unsub();
    });
  });

  return router;
}

export default createWhatsAppSseRouter;
