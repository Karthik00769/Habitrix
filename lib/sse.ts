/**
 * Server-Sent Events (SSE) Manager
 * 
 * Manages real-time connections for streaming updates to clients.
 */

export interface SSEClient {
  userId: string;
  controller: ReadableStreamDefaultController;
}

// Store active SSE connections
const clients = new Map<string, SSEClient[]>();

/**
 * Add a new SSE client connection
 */
export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId)!.push({ userId, controller });
}

/**
 * Remove an SSE client connection
 */
export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  const userClients = clients.get(userId);
  if (userClients) {
    const filtered = userClients.filter(c => c.controller !== controller);
    if (filtered.length === 0) {
      clients.delete(userId);
    } else {
      clients.set(userId, filtered);
    }
  }
}

/**
 * broadcast(data) - Sends JSON to all connected clients for a specific user
 * 
 * Usage:
 * broadcast(userId, {
 *   type: "habit_completed",
 *   habitId: "123",
 *   habitName: "Exercise",
 *   newTokenBalance: 42,
 *   newStreak: 5,
 *   completedAt: "2024-11-24T10:30:00Z"
 * });
 */
export function broadcast(userId: string, data: any) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  userClients.forEach(client => {
    try {
      client.controller.enqueue(encoded);
    } catch (error) {
      console.error('Error broadcasting SSE event:', error);
      removeClient(userId, client.controller);
    }
  });
}
