/**
 * React Hook for SSE Real-time Updates
 * 
 * Usage:
 * 
 * import { useRealtime } from '@/hooks/useRealtime';
 * 
 * function MyComponent() {
 *   const { connected, lastEvent } = useRealtime({
 *     onHabitCompleted: (habitId, timestamp) => {
 *       console.log('Habit completed:', habitId);
 *       // Refresh habits list
 *     },
 *     onTokenUpdate: (newBalance) => {
 *       console.log('New balance:', newBalance);
 *       // Update token display
 *     },
 *     onAchievementUnlocked: (name) => {
 *       console.log('Achievement unlocked:', name);
 *       // Show notification
 *     },
 *   });
 * 
 *   return <div>Connected: {connected ? 'Yes' : 'No'}</div>;
 * }
 */

'use client';

import { useEffect, useState, useRef } from 'react';

interface RealtimeEvent {
  type: 'habit_completed' | 'token_update' | 'achievement_unlocked' | 'connected';
  habitId?: string;
  timestamp?: string;
  newBalance?: number;
  name?: string;
}

interface UseRealtimeOptions {
  onHabitCompleted?: (habitId: string, timestamp: string) => void;
  onTokenUpdate?: (newBalance: number) => void;
  onAchievementUnlocked?: (name: string) => void;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource('/api/realtime');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);
        setLastEvent(data);

        // Call appropriate callback
        if (data.type === 'habit_completed' && options.onHabitCompleted) {
          options.onHabitCompleted(data.habitId!, data.timestamp!);
        } else if (data.type === 'token_update' && options.onTokenUpdate) {
          options.onTokenUpdate(data.newBalance!);
        } else if (data.type === 'achievement_unlocked' && options.onAchievementUnlocked) {
          options.onAchievementUnlocked(data.name!);
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, [options.onHabitCompleted, options.onTokenUpdate, options.onAchievementUnlocked]);

  return { connected, lastEvent };
}
