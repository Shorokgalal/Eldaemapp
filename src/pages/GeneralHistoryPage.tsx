import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import Header from '../components/layout/Header';
import Loading from '../components/common/Loading';
import VotingHistory from '../components/common/VotingHistory';
import { GoalStatus, UserGoalHistory, Cycle, DailyRecord, VoteHistoryItem } from '../types/goal.types';
import { getDaysFromStart, getDaysSinceStart, isSameDay } from '../utils/date';
import { Check, X } from 'lucide-react';

// Status badge component
const StatusBadge: React.FC<{ status: GoalStatus }> = ({ status }) => {
  const { t } = useTranslation();
  
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-600';
      case 'paused':
        return 'bg-yellow-100 text-yellow-600';
      case 'finished':
        return 'bg-green-100 text-green-600';
      case 'pending_renewal':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return t('history.statusActive');
      case 'paused':
        return t('history.statusPaused');
      case 'finished':
        return t('history.statusFinished');
      case 'pending_renewal':
        return t('history.statusPendingRenewal');
      default:
        return status;
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusLabel()}
    </span>
  );
};

// Goal card component for the list
interface GoalHistoryCardProps {
  goalHistory: UserGoalHistory;
  votes: VoteHistoryItem[];
  onClick: () => void;
}

const GoalHistoryCard: React.FC<GoalHistoryCardProps> = ({ goalHistory, votes, onClick }) => {
  const { t } = useTranslation();
  
  // Calculate stats
  const totalCycles = goalHistory.cycles.length;
  const completionRate = calculateOverallCompletionRate(goalHistory.cycles);
  
  return (
    <div
      className="bg-white rounded-lg shadow-card cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      <div className="p-4" onClick={onClick}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text text-lg">{goalHistory.goalTitle}</h3>
          <StatusBadge status={goalHistory.status} />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">{t('history.cycles')}:</span>
            <span className="font-medium">{totalCycles}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">{t('history.completion')}:</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">{t('history.streak')}:</span>
            <span className="font-medium text-orange-500">{goalHistory.currentStreak}</span>
          </div>
        </div>
      </div>
      
      {/* Voting History - starts from left to right */}
      <div className="border-t border-gray-200">
        <VotingHistory votes={votes} maxDays={30} />
      </div>
    </div>
  );
};

// Helper function to calculate overall completion rate
const calculateOverallCompletionRate = (cycles: Cycle[]): number => {
  if (cycles.length === 0) return 0;
  
  let totalCompleted = 0;
  let totalDays = 0;
  
  cycles.forEach(cycle => {
    cycle.dailyRecords.forEach(record => {
      if (record.status !== 'skipped') {
        totalDays++;
        if (record.status === 'completed') {
          totalCompleted++;
        }
      }
    });
  });
  
  if (totalDays === 0) return 0;
  return Math.round((totalCompleted / totalDays) * 100);
};

// Helper function to calculate total days tracked
const calculateTotalDaysTracked = (goalsHistory: UserGoalHistory[]): number => {
  let total = 0;
  goalsHistory.forEach(goalHistory => {
    goalHistory.cycles.forEach(cycle => {
      total += cycle.dailyRecords.filter(r => r.status !== 'skipped').length;
    });
  });
  return total;
};

// Helper function to calculate total cycles
const calculateTotalCycles = (goalsHistory: UserGoalHistory[]): number => {
  return goalsHistory.reduce((sum, gh) => sum + gh.cycles.length, 0);
};

// Helper function to count active goals
const countActiveGoals = (goalsHistory: UserGoalHistory[]): number => {
  return goalsHistory.filter(gh => gh.status === 'active').length;
};

// Helper function to calculate average completion rate
const calculateAverageCompletionRate = (goalsHistory: UserGoalHistory[]): number => {
  if (goalsHistory.length === 0) return 0;
  
  const rates = goalsHistory.map(gh => calculateOverallCompletionRate(gh.cycles));
  const sum = rates.reduce((a, b) => a + b, 0);
  return Math.round(sum / goalsHistory.length);
};

// Helper function to build cycles from votes (30-day periods)
const buildCyclesFromVotes = (votes: any[]): Cycle[] => {
  if (votes.length === 0) return [];
  
  const cycles: Cycle[] = [];
  const votesByDate = new Map<string, any>();
  
  // Group votes by date string
  votes.forEach(vote => {
    const dateStr = vote.date.toISOString().split('T')[0];
    votesByDate.set(dateStr, vote);
  });
  
  // Get date range
  const firstDate = new Date(votes[0].date);
  const lastDate = new Date(votes[votes.length - 1].date);
  
  // Create cycles (30-day periods)
  let cycleNumber = 1;
  let currentStart = new Date(firstDate);
  
  while (currentStart <= lastDate) {
    const cycleEnd = new Date(currentStart);
    cycleEnd.setDate(cycleEnd.getDate() + 29); // 30-day cycle
    
    const dailyRecords: DailyRecord[] = [];
    const cycleEndDate = cycleEnd > lastDate ? lastDate : cycleEnd;
    
    // Generate daily records for this cycle
    for (let d = new Date(currentStart); d <= cycleEndDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const vote = votesByDate.get(dateStr);
      
      if (vote) {
        dailyRecords.push({
          date: new Date(d),
          status: vote.vote === 'yes' ? 'completed' : 'failed',
          quantity: vote.quantity,
          reflection: undefined,
        });
      }
    }
    
    // Only add cycle if it has records
    if (dailyRecords.length > 0) {
      const isActive = cycleEndDate >= new Date(Date.now() - 24 * 60 * 60 * 1000);
      cycles.push({
        cycleNumber,
        startDate: new Date(currentStart),
        endDate: cycleEnd > lastDate ? null : cycleEnd,
        status: isActive ? 'active' : 'finished',
        dailyRecords,
      });
      cycleNumber++;
    }
    
    currentStart = new Date(cycleEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  
  return cycles;
};

// Helper function to calculate current streak from votes
const calculateStreakFromVotes = (votes: any[]): number => {
  if (votes.length === 0) return 0;
  
  // Sort votes by date descending
  const sortedVotes = [...votes].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const vote of sortedVotes) {
    const voteDate = new Date(vote.date);
    voteDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - voteDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only count "yes" votes
    if (vote.vote === 'yes') {
      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++;
        currentDate = voteDate;
      } else {
        break;
      }
    }
  }
  
  return streak;
};


const GeneralHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [goalsHistory, setGoalsHistory] = useState<UserGoalHistory[]>([]);
  const [votesByGoal, setVotesByGoal] = useState<Map<string, VoteHistoryItem[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedGoalForVoting, setSelectedGoalForVoting] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null);
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGoalsHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel for better performance
        const [votesSnapshot, subscriptionsSnapshot, goalsSnapshot] = await Promise.all([
          getDocs(query(
            collection(db, 'votes'),
            where('userId', '==', user.uid)
          )),
          getDocs(query(
            collection(db, 'subscriptions'),
            where('userId', '==', user.uid)
          )),
          getDocs(collection(db, 'goals'))
        ]);
        
        // Build maps for quick lookup
        const goalsMap = new Map();
        goalsSnapshot.docs.forEach(doc => {
          goalsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        
        const subscriptionsMap = new Map();
        subscriptionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          subscriptionsMap.set(data.goalId, {
            status: data.status || 'active',
            joinedAt: data.joinedAt?.toDate() || new Date(),
          });
        });
        
        // Group votes by goalId
        const votesByGoal = new Map<string, any[]>();
        votesSnapshot.docs.forEach(doc => {
          const voteData = doc.data();
          const goalId = voteData.goalId;
          if (!votesByGoal.has(goalId)) {
            votesByGoal.set(goalId, []);
          }
          votesByGoal.get(goalId)!.push({
            id: doc.id,
            ...voteData,
            date: voteData.date?.toDate() || new Date(),
          });
        });
        
        // Build UserGoalHistory array and votes history
        const historyData: UserGoalHistory[] = [];
        const votesHistoryMap = new Map<string, VoteHistoryItem[]>();
        
        votesByGoal.forEach((votes, goalId) => {
          const goal = goalsMap.get(goalId);
          const subscription = subscriptionsMap.get(goalId);
          
          if (!goal) return; // Skip if goal not found
          
          // Sort votes by date
          votes.sort((a, b) => a.date.getTime() - b.date.getTime());
          
          // Group votes into cycles (30-day periods)
          const cycles = buildCyclesFromVotes(votes);
          
          // Calculate current streak
          const currentStreak = calculateStreakFromVotes(votes);
          
          historyData.push({
            id: goalId,
            goalId: goalId,
            goalTitle: goal.title || 'Untitled Goal',
            userId: user.uid,
            status: subscription?.status || 'active',
            currentStreak,
            joinedAt: subscription?.joinedAt || (votes[0]?.date || new Date()),
            cycles,
          });
          
          // Build voting history for this goal (30 days from join date)
          const joinDate = subscription?.joinedAt || (votes[0]?.date || new Date());
          const cycleDays = getDaysFromStart(joinDate, 30);
          const currentDay = getDaysSinceStart(joinDate);
          
          const votesMap = new Map<string, 'yes' | 'no'>();
          
          votes.forEach((vote) => {
            const dateKey = vote.date.toISOString().split('T')[0];
            if (!votesMap.has(dateKey)) {
              votesMap.set(dateKey, vote.vote);
            }
          });
          
          const votesArray: VoteHistoryItem[] = cycleDays.map((date: Date, index: number) => {
            const dateKey = date.toISOString().split('T')[0];
            const dayNumber = index + 1;
            
            // Only show votes up to current day
            if (dayNumber > currentDay) {
              return {
                date,
                vote: 'none' as const,
              };
            }
            
            return {
              date,
              vote: votesMap.get(dateKey) || 'none',
            };
          });
          
          votesHistoryMap.set(goalId, votesArray);
        });
        
        setGoalsHistory(historyData);
        setVotesByGoal(votesHistoryMap);
      } catch (error) {
        console.error('Error fetching goals history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalsHistory();
  }, [user]);

  const handleVoteClick = (vote: 'yes' | 'no') => {
    setSelectedVote(vote);
    setShowReflectionInput(false);
    setReflectionText('');
    setQuantity(1);
  };

  const handleAddReflectionClick = () => {
    setShowReflectionInput(true);
  };

  const handleSubmitReflection = async () => {
    if (!user || !selectedGoalForVoting || !selectedVote) return;

    setSubmitting(true);

    try {
      // Save vote
      await addDoc(collection(db, 'votes'), {
        userId: user.uid,
        goalId: selectedGoalForVoting,
        vote: selectedVote,
        date: new Date(),
        quantity: selectedVote === 'yes' ? quantity : 0,
      });

      // Save reflection if provided
      if (reflectionText.trim()) {
        await addDoc(collection(db, 'reflections'), {
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          ...(user.photoURL && { userPhotoURL: user.photoURL }),
          goalId: selectedGoalForVoting,
          content: reflectionText,
          createdAt: new Date(),
          likes: [],
        });
      }

      // Reset form
      setSelectedGoalForVoting(null);
      setSelectedVote(null);
      setShowReflectionInput(false);
      setReflectionText('');
      setQuantity(1);

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error saving vote:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasVotedTodayForGoal = (goalId: string): boolean => {
    const votes = votesByGoal.get(goalId);
    if (!votes) return false;

    const today = new Date();
    return votes.some((v) => isSameDay(v.date, today) && v.vote !== 'none');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Loading text={t('common.loading')} />
      </div>
    );
  }

  const avgCompletionRate = calculateAverageCompletionRate(goalsHistory);
  const activeGoalsCount = countActiveGoals(goalsHistory);
  const totalCycles = calculateTotalCycles(goalsHistory);
  const totalDays = calculateTotalDaysTracked(goalsHistory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto p-4">
        {/* Overall Performance Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">{t('history.overallPerformance')}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.avgCompletion')}</p>
              <p className="text-2xl font-bold text-primary">{avgCompletionRate}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.activeGoals')}</p>
              <p className="text-2xl font-bold text-blue-500">{activeGoalsCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.totalCycles')}</p>
              <p className="text-2xl font-bold text-green-500">{totalCycles}</p>
            </div>
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.totalDays')}</p>
              <p className="text-2xl font-bold text-purple-500">{totalDays}</p>
            </div>
          </div>
        </section>

        {/* Goals Breakdown Section */}
        <section className="mb-32">
          <h2 className="text-lg font-semibold text-text mb-4">{t('history.goalsBreakdown')}</h2>
          
          {goalsHistory.length > 0 ? (
            <div className="space-y-3">
              {goalsHistory.map((goalHistory) => (
                <GoalHistoryCard
                  key={goalHistory.id}
                  goalHistory={goalHistory}
                  votes={votesByGoal.get(goalHistory.goalId) || []}
                  onClick={() => navigate(`/history/goal/${goalHistory.goalId}`, { 
                    state: { goalHistory, from: 'general-history' } 
                  })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-card">
              <p>{t('history.noHistory')}</p>
            </div>
          )}
        </section>
      </div>

      {/* Fixed Bottom Section - Show active goals to vote on */}
      {goalsHistory.some(gh => gh.status === 'active' && !hasVotedTodayForGoal(gh.goalId)) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {!selectedGoalForVoting && !selectedVote && !showReflectionInput && (
              <div className="space-y-3">
                {goalsHistory
                  .filter(gh => gh.status === 'active' && !hasVotedTodayForGoal(gh.goalId))
                  .map((goalHistory) => (
                    <div key={goalHistory.id} className="bg-gray-50 rounded-lg">
                      <div className="px-4 py-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700 flex-1">
                          {t('goalDetails.todayQuestion') || 'Did you achieve your goal today?'}
                        </p>
                        <div className="flex gap-3 ml-4">
                          <button
                            onClick={() => {
                              setSelectedGoalForVoting(goalHistory.goalId);
                              handleVoteClick('yes');
                            }}
                            className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-md"
                            aria-label="Yes"
                          >
                            <Check size={24} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedGoalForVoting(goalHistory.goalId);
                              handleVoteClick('no');
                            }}
                            className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-md"
                            aria-label="No"
                          >
                            <X size={24} />
                          </button>
                        </div>
                      </div>
                      <div className="px-4 pb-3">
                        <p className="text-xs text-gray-600">{goalHistory.goalTitle}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {selectedGoalForVoting && selectedVote && !showReflectionInput && (
              <div className="bg-gray-50 rounded-lg px-4 py-4">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  {goalsHistory.find(gh => gh.goalId === selectedGoalForVoting)?.goalTitle}
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-800 mb-3">
                      {selectedVote === 'yes' ? '✨ Well done!' : '💭 Never mind!'}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">Record your performance</p>
                  </div>
                  
                  {selectedVote === 'yes' && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={handleAddReflectionClick}
                    className="w-full px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {showReflectionInput && (
              <div className="bg-gray-50 rounded-lg px-4 py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      {selectedVote === 'yes' ? '🎉 Great job!' : '💪 Keep going!'}
                    </p>
                    <button
                      onClick={() => {
                        setShowReflectionInput(false);
                        setSelectedVote(null);
                        setSelectedGoalForVoting(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Share your thoughts... (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                    disabled={submitting}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitReflection}
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : 'Submit'}
                    </button>
                    <button
                      onClick={() => handleSubmitReflection()}
                      disabled={submitting}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralHistoryPage;
