import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, addDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import VotingHistory from '../components/common/VotingHistory';
import CommentCard from '../components/cards/CommentCard';
import BottomActionBar from '../components/layout/BottomActionBar';
import RenewalForm from '../components/forms/RenewalForm';
import Loading from '../components/common/Loading';
import Dropdown from '../components/common/Dropdown';
import { ArrowLeft } from 'lucide-react';
import { VoteHistoryItem } from '../types/goal.types';
import { Reflection } from '../types/reflection.types';
import { getDaysFromStart, getDaysSinceStart, isSameDay } from '../utils/date';

const GoalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<VoteHistoryItem[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);
  const [todayQuestion, setTodayQuestion] = useState('');
  const [subscriptionDate, setSubscriptionDate] = useState<Date | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [cycleStartDate, setCycleStartDate] = useState<Date | null>(null);
  const [todayVote, setTodayVote] = useState<{ vote: 'yes' | 'no'; hasReflection: boolean } | null>(null);
  const [showRenewalForm, setShowRenewalForm] = useState(false);

  // Fetch goal data when id changes
  useEffect(() => {
    let isCancelled = false;
    
    const fetchGoal = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setGoal(null);

      try {
        const goalDoc = await getDoc(doc(db, 'goals', id));
        
        if (isCancelled) return;
        
        if (goalDoc.exists()) {
          const data = goalDoc.data();
          setGoal({ 
            id: goalDoc.id, 
            title: data.title,
            ...data 
          });
          setTodayQuestion(t('goalDetails.todayQuestion'));
        } else {
          setGoal(null);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching goal:', error);
          setGoal(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchGoal();
    
    return () => {
      isCancelled = true;
    };
  }, [id, t]);

  // Fetch subscription date and votes when goal or user changes
  useEffect(() => {
    let isCancelled = false;
    
    const fetchVotesAndSubscription = async () => {
      if (!id || !user) {
        setVotes([]);
        setSubscriptionDate(null);
        return;
      }

      try {
        // Fetch subscription to get join date and cycle info
        const subscriptionsQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', user.uid),
          where('goalId', '==', id)
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        
        let joinDate = new Date(); // Default to today if no subscription found
        let subId = '';
        let cycle = 1;
        let cycleStart = new Date();
        
        if (!subscriptionsSnapshot.empty) {
          const subDoc = subscriptionsSnapshot.docs[0];
          const subData = subDoc.data();
          subId = subDoc.id;
          joinDate = subData.joinedAt?.toDate() || new Date();
          cycle = subData.currentCycle || 1;
          cycleStart = subData.cycleStartDate?.toDate() || joinDate;
        }
        
        if (isCancelled) return;
        setSubscriptionDate(joinDate);
        setSubscriptionId(subId);
        setCurrentCycle(cycle);
        setCycleStartDate(cycleStart);
        
        // Check if 30 days passed since cycle start
        const daysSinceCycleStart = getDaysSinceStart(cycleStart);
        if (daysSinceCycleStart > 30) {
          setShowRenewalForm(true);
          setVotes([]);
          return;
        }
        
        // Fetch votes for current cycle
        const votesQuery = query(
          collection(db, 'votes'),
          where('userId', '==', user.uid),
          where('goalId', '==', id),
          where('cycleNumber', '==', cycle)
        );
        const votesSnapshot = await getDocs(votesQuery);
        
        if (isCancelled) return;
        
        // Build a map of votes by date and check for today's vote
        const votesByDate = new Map<string, { vote: 'yes' | 'no'; hasReflection: boolean }>();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        votesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const voteDate = data.date?.toDate() || new Date();
          const dateStr = voteDate.toISOString().split('T')[0];
          votesByDate.set(dateStr, {
            vote: data.vote,
            hasReflection: data.hasReflection || false
          });
          
          // Check if user voted today
          if (dateStr === todayStr) {
            setTodayVote({
              vote: data.vote,
              hasReflection: data.hasReflection || false
            });
          }
        });
        
        // Generate 30 days starting from cycle start date
        const cycleDays = getDaysFromStart(cycleStart, 30);
        const currentDay = getDaysSinceStart(cycleStart);
        
        const votesData: VoteHistoryItem[] = cycleDays.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayNumber = index + 1;
          
          // Only show squares up to current day
          if (dayNumber > currentDay) {
            return {
              date,
              vote: 'none' as const,
            };
          }
          
          const voteData = votesByDate.get(dateStr);
          const vote = voteData?.vote || 'none';
          return {
            date,
            vote: vote as 'yes' | 'no' | 'none',
          };
        });
        
        if (!isCancelled) {
          setVotes(votesData);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching votes:', error);
        }
      }
    };

    fetchVotesAndSubscription();
    
    return () => {
      isCancelled = true;
    };
  }, [id, user]);

  // Fetch reflections when goal changes
  useEffect(() => {
    let isCancelled = false;
    
    const fetchReflections = async () => {
      if (!id) {
        setReflections([]);
        setReflectionsLoading(false);
        return;
      }

      setReflectionsLoading(true);

      try {
        const reflectionsQuery = query(
          collection(db, 'reflections'),
          where('goalId', '==', id)
        );
        const reflectionsSnapshot = await getDocs(reflectionsQuery);
        
        if (isCancelled) return;
        
        const reflectionsData = reflectionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Reflection[];
        
        // Sort by createdAt in memory instead of in Firestore
        reflectionsData.sort((a, b) => {
          const dateA = a.createdAt?.getTime() || 0;
          const dateB = b.createdAt?.getTime() || 0;
          return dateB - dateA; // descending order
        });
        
        setReflections(reflectionsData);
        setReflectionsLoading(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching reflections:', error);
          setReflectionsLoading(false);
        }
      }
    };

    fetchReflections();
    
    return () => {
      isCancelled = true;
    };
  }, [id]);

  const addReflection = async (data: Omit<Reflection, 'id' | 'createdAt' | 'likes'>) => {
    await addDoc(collection(db, 'reflections'), {
      ...data,
      createdAt: new Date(),
      likes: [],
    });
    // Refresh reflections after adding
    if (id) {
      const reflectionsQuery = query(
        collection(db, 'reflections'),
        where('goalId', '==', id)
      );
      const reflectionsSnapshot = await getDocs(reflectionsQuery);
      const reflectionsData = reflectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Reflection[];
      
      // Sort in memory
      reflectionsData.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
      
      setReflections(reflectionsData);
    }
  };

  const toggleLike = async (reflectionId: string, userId: string) => {
    const reflection = reflections.find((r) => r.id === reflectionId);
    if (!reflection) return;

    const reflectionRef = doc(db, 'reflections', reflectionId);
    
    if (reflection.likes.includes(userId)) {
      await updateDoc(reflectionRef, {
        likes: arrayRemove(userId),
      });
    } else {
      await updateDoc(reflectionRef, {
        likes: arrayUnion(userId),
      });
    }
    
    // Refresh reflections after toggling like
    if (id) {
      const reflectionsQuery = query(
        collection(db, 'reflections'),
        where('goalId', '==', id)
      );
      const reflectionsSnapshot = await getDocs(reflectionsQuery);
      const reflectionsData = reflectionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Reflection[];
      
      // Sort in memory
      reflectionsData.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
      
      setReflections(reflectionsData);
    }
  };

  const handleVote = async (vote: 'yes' | 'no', content: string, quantity?: number) => {
    if (!user || !id || !subscriptionId) return;

    // Check if user already voted today
    if (todayVote) {
      alert(t('voting.alreadyVoted'));
      return;
    }

    try {
      const hasReflection = !!(content && content.trim());
      
      // Save vote
      await addDoc(collection(db, 'votes'), {
        userId: user.uid,
        goalId: id,
        subscriptionId: subscriptionId,
        cycleNumber: currentCycle,
        vote,
        date: new Date(),
        quantity: vote === 'yes' ? (quantity || 0) : 0,
        hasReflection,
      });

      // Only save reflection if content is provided
      if (hasReflection) {
        await addReflection({
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          ...(user.photoURL && { userPhotoURL: user.photoURL }),
          goalId: id,
          content: content.trim(),
        });
      }

      // Update local state
      setTodayVote({ vote, hasReflection });
      
      const newVotes = [...votes];
      const todayIndex = newVotes.findIndex((v) => isSameDay(v.date, new Date()));
      if (todayIndex !== -1) {
        newVotes[todayIndex].vote = vote;
        setVotes(newVotes);
      }
    } catch (error) {
      console.error('Error saving vote:', error);
      alert('Failed to save your vote. Please try again.');
    }
  };

  const handleLike = (reflectionId: string) => {
    if (user) {
      toggleLike(reflectionId, user.uid);
    }
  };

  const handleRenewal = async (renewalData: {
    cycleWhy: string;
    workSchedule: string;
    goals: string;
  }) => {
    if (!user || !id || !subscriptionId) return;

    try {
      // Save renewal data
      await addDoc(collection(db, 'renewals'), {
        userId: user.uid,
        goalId: id,
        subscriptionId,
        cycleNumber: currentCycle + 1,
        createdAt: new Date(),
        ...renewalData,
      });

      // Update subscription
      await updateDoc(doc(db, 'subscriptions', subscriptionId), {
        currentCycle: currentCycle + 1,
        cycleStartDate: new Date(),
      });

      // Reset state for new cycle
      setCurrentCycle(currentCycle + 1);
      setCycleStartDate(new Date());
      setShowRenewalForm(false);
      setTodayVote(null);
      setVotes([]);
      
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error renewing cycle:', error);
      alert('Failed to renew cycle. Please try again.');
    }
  };

  const menuItems = [
    { label: t('goalDetails.history'), onClick: () => navigate(`/history/goal/${id}`, { state: { from: 'goal-detail' } }) },
    { label: t('goalDetails.pause'), onClick: () => console.log('Pause') },
    { label: t('goalDetails.finished'), onClick: () => console.log('Finished') },
    { label: t('goalDetails.sos'), onClick: () => console.log('SOS'), danger: true },
  ];

  if (loading) {
    console.log('[GoalDetails] Showing loading screen');
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-primary transition-colors p-1">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-text">{t('common.loading')}</h1>
            </div>
            <Dropdown items={menuItems} />
          </div>
        </header>
        <Loading text={t('common.loading')} />
      </div>
    );
  }

  if (! goal) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-primary transition-colors p-1">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-text">Goal Not Found</h1>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto p-4 text-center py-12">
          <p className="text-error">Goal not found</p>
        </div>
      </div>
    );
  }

  // Show renewal form if 30 days have passed
  if (showRenewalForm && goal) {
    return <RenewalForm goalTitle={goal.title} onSubmit={handleRenewal} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sub-header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-primary transition-colors p-1"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-text">{goal.title}</h1>
          </div>
          <Dropdown items={menuItems} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Voting History */}
        <div className="bg-white border-b border-gray-200">
          <VotingHistory votes={votes} maxDays={30} />
        </div>

        {/* Community Feed */}
        <div className="p-4 space-y-4">
          {reflectionsLoading ? (
            <Loading text={t('common.loading')} />
          ) : reflections.length > 0 ? (
            reflections.map((reflection) => (
              <CommentCard
                key={reflection.id}
                comment={reflection}
                currentUserId={user?.uid || ''}
                onLike={() => handleLike(reflection.id)}
                language={i18n.language}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No reflections yet. </p>
              <p className="text-sm mt-2">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
  {/* spacer to avoid content being hidden by fixed BottomActionBar */}
  <div className="h-24 md:h-28 lg:h-32 pb-[env(safe-area-inset-bottom)]" aria-hidden="true" />
  <BottomActionBar 
    question={todayQuestion} 
    onVote={handleVote} 
    hasVotedToday={!!todayVote}
    todayVoteType={todayVote?.vote}
    canAddReflection={todayVote ? !todayVote.hasReflection : false}
  />
    </div>
  );
};

export default GoalDetails;
