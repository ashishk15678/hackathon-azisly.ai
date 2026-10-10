import { NextRequest } from "next/server";
import { sseClients } from "@/lib/game-store";

/**
 * SSE endpoint — one persistent GET per player per room.
 *
 * The connection is a regular HTTP/1.1 keep-alive stream with
 * Content-Type: text/event-stream.  No WebSocket, no extra infra.
 *
 * To avoid timeout on serverless platforms set a max TTL and let the
 * client reconnect (EventSource does this automatically).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const clientId = crypto.randomUUID();

  let controllerRef: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;

      // Register client
      sseClients.set(clientId, { id: clientId, roomCode: code, controller });

      // Send initial keep-alive comment so the browser knows we're alive
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(": connected\n\n"));
    },
    cancel() {
      sseClients.delete(clientId);
    },
  });

  // Heartbeat every 25 s to prevent proxy/firewall from killing idle connections
  const encoder = new TextEncoder();
  const interval = setInterval(() => {
    try {
      controllerRef?.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "ping" })}\n\n`),
      );
    } catch {
      clearInterval(interval);
      sseClients.delete(clientId);
    }
  }, 25_000);

  // Clean up when request is aborted (tab closed, navigation, etc.)
  request.signal.addEventListener("abort", () => {
    clearInterval(interval);
    sseClients.delete(clientId);
    try {
      controllerRef?.close();
    } catch {
      /* already closed */
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // tell nginx not to buffer
    },
  });
}
