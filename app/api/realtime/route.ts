/**
 * GET /api/realtime
 * 
 * Server-Sent Events (SSE) endpoint for real-time updates.
 * 
 * Sends real-time updates when habits are completed.
 * 
 * Event structure:
 * {
 *   type: "habit_completed",
 *   habitId: "<habit-id>",
 *   habitName: "<habit-name>",
 *   newTokenBalance: <integer>,
 *   newStreak: <integer>,
 *   completedAt: "<ISO timestamp>"
 * }
 * 
 * Frontend usage:
 * 
 * useEffect(() => {
 *   const es = new EventSource("/api/realtime");
 *   
 *   es.onmessage = (event) => {
 *     const data = JSON.parse(event.data);
 *     
 *     if (data.type === "habit_completed") {
 *       setTokens(data.newTokenBalance);
 *       setStreak(data.newStreak);
 *       addToRecentActivity(data);
 *     }
 *   };
 *   
 *   return () => es.close();
 * }, []);
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addClient, removeClient } from '@/lib/sse';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add client to SSE manager
      addClient(userId, controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      const message = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(message));

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (error) {
          clearInterval(heartbeat);
          removeClient(userId, controller);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        removeClient(userId, controller);
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
