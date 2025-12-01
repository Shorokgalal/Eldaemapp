import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Goal } from '../types/goal.types';

export const useGoals = (userId?: string) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscribedGoalIds, setSubscribedGoalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all goals
    const goalsQuery = query(collection(db, 'goals'));

    const unsubscribe = onSnapshot(goalsQuery, async (snapshot) => {
      const goalsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Calculate vote statistics from votes collection
          let totalVotes = 0;
          let yesVotes = 0;
          let noVotes = 0;

          try {
            const votesQuery = query(
              collection(db, 'votes'),
              where('goalId', '==', doc.id)
            );
            const votesSnapshot = await getDocs(votesQuery);
            
            totalVotes = votesSnapshot.size;
            votesSnapshot.forEach((voteDoc) => {
              const voteData = voteDoc.data();
              if (voteData.vote === 'yes') {
                yesVotes++;
              } else if (voteData.vote === 'no') {
                noVotes++;
              }
            });
          } catch (error) {
            console.error('Error fetching votes for goal:', doc.id, error);
          }
          
          return {
            id: doc.id,
            title: data.title || 'Untitled Goal',
            description: data.description || '',
            category: data.category,
            color: data.color,
            icon: data.icon,
            duration: data.duration,
            createdBy: data.createdBy || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            subscriberCount: data.subscribers || 0,
            progress: data.progress || 0,
            isPinned: data.isPinned || false,
            totalVotes,
            yesVotes,
            noVotes,
          } as Goal;
        })
      );

      setGoals(goalsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (! userId) {
      setSubscribedGoalIds([]);
      return;
    }

    // Fetch user's subscriptions
    const fetchSubscriptions = async () => {
      try {
        const subscriptionsQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', userId),
          where('status', '==', 'active')
        );

        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const goalIds = subscriptionsSnapshot.docs.map((doc) => doc. data().goalId);
        setSubscribedGoalIds(goalIds);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchSubscriptions();
  }, [userId]);

  return { goals, subscribedGoalIds, loading };
};
