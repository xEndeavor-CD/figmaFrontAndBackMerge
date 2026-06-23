/**
 * Custom hook for fetching quest progress for a specific quest
 * In a real app, this would call an activity service
 */
import { useEffect, useState } from 'react';

// Mock progress data - in real app this would come from API
const getMockProgress = (questId: string): number => {
  // Simple hash function to generate consistent pseudo-random progress
  let hash = 0;
  for (let i = 0; i < questId.length; i++) {
    hash = questId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Return a value between 0 and 100
  return Math.abs(hash) % 101;
};

export function useQuestProgress(questId: string | null): number {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!questId) {
      setProgress(0);
      return;
    }

    // Simulate API delay
    const timer = setTimeout(() => {
      // In real app: call activity service to get actual progress
      const mockProgress = getMockProgress(questId);
      setProgress(mockProgress);
    }, 300);

    return () => clearTimeout(timer);
  }, [questId]);

  return progress;
}