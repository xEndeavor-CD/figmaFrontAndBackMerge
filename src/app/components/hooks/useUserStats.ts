/**
 * Custom hook for fetching user statistics
 * In a real app, this would call a user/auth service
 */
import { useEffect, useState } from 'react';
import type { AuthUser } from '../../../api/auth';

// Mock user stats - in real app this would come from API
const getMockUserStats = (userId: string | null) => {
  // Generate deterministic but varied stats based on userId
  let seed = 0;
  if (userId) {
    for (let i = 0; i < Math.min(userId.length, 10); i++) {
      seed += userId.charCodeAt(i);
    }
  }

  // Simple pseudo-random function
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  return {
    totalXP: Math.floor(rand() * 5000) + 500,
    currentStreak: Math.floor(rand() * 30),
    completedQuests: Math.floor(rand() * 50) + 5,
    level: Math.floor(rand() * 20) + 1,
    rank: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'][Math.floor(rand() * 5)],
    leaderboard: Array.from({ length: 10 }, (_, i) => ({
      id: `user-${i + 1}`,
      userId: `user-${i + 1}`,
      username: [`Alice`, `Bob`, `Charlie`, `Diana`, `Eve`, `Frank`, `Grace`, `Henry`][i % 8] + (i + 1),
      totalPoints: Math.floor(rand() * 10000) + 1000,
      rank: i + 1
    }))
  };
};

export function useUserStats() {
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, this would fetch from an API using the user's ID
  // For now, we'll simulate with a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // In real app: get user from context/auth hook
        // For demo, we'll use a mock user ID
        const mockUserId = 'demo-user-123';
        const stats = getMockUserStats(mockUserId);
        setUserStats(stats);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load user stats');
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { userStats, isLoading, error };
}