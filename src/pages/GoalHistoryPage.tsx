import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Dropdown from '../components/common/Dropdown';
import { GoalStatus, UserGoalHistory, Cycle, DailyRecord } from '../types/goal.types';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import Loading from '../components/common/Loading';

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

// Daily record status badge
const DailyStatusBadge: React.FC<{ status: 'completed' | 'failed' | 'skipped' }> = ({ status }) => {
  const { t } = useTranslation();
  
  const getConfig = () => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', label: t('history.completed') };
      case 'failed':
        return { bg: 'bg-red-100', text: 'text-red-700', label: t('history.failed') };
      case 'skipped':
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: t('history.skipped') };
    }
  };

  const config = getConfig();
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Daily record item component
interface DailyRecordItemProps {
  record: DailyRecord;
  language: string;
}

const DailyRecordItem: React.FC<DailyRecordItemProps> = ({ record, language }) => {
  const { t } = useTranslation();
  const locale = language === 'ar' ? ar : enUS;
  
  return (
    <div className="py-3 px-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {format(record.date, 'EEEE, MMMM d, yyyy', { locale })}
          </span>
          <DailyStatusBadge status={record.status} />
        </div>
        {record.quantity !== undefined && (
          <span className="text-sm text-gray-600">{record.quantity}x</span>
        )}
      </div>
      {record.reflection && (
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-medium">{t('history.reflection')}:</span> {record.reflection}
        </p>
      )}
    </div>
  );
};

// Cycle card component
interface CycleCardProps {
  cycle: Cycle;
  language: string;
}

const CycleCard: React.FC<CycleCardProps> = ({ cycle, language }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const locale = language === 'ar' ? ar : enUS;
  
  // Calculate stats
  const totalRecords = cycle.dailyRecords.length;
  const completedDays = cycle.dailyRecords.filter(r => r.status === 'completed').length;
  const failedDays = cycle.dailyRecords.filter(r => r.status === 'failed').length;
  const trackedDays = cycle.dailyRecords.filter(r => r.status !== 'skipped').length;
  const completionRate = trackedDays > 0 ? Math.round((completedDays / trackedDays) * 100) : 0;
  
  const formatDateRange = () => {
    const startStr = format(cycle.startDate, 'MMM d, yyyy', { locale });
    const endStr = cycle.endDate 
      ? format(cycle.endDate, 'MMM d, yyyy', { locale }) 
      : t('history.present');
    return `${startStr} - ${endStr}`;
  };

  // Sort records by date (most recent first)
  const sortedRecords = [...cycle.dailyRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Cycle Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-text">
            {t('history.cycleNumber', { number: cycle.cycleNumber })}
          </h4>
          <StatusBadge status={cycle.status} />
        </div>
        <p className="text-sm text-gray-600 mb-4">{formatDateRange()}</p>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-500">{completionRate}%</p>
            <p className="text-xs text-gray-600">{t('history.completion')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-500">{completedDays}</p>
            <p className="text-xs text-gray-600">{t('history.completed')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">{failedDays}</p>
            <p className="text-xs text-gray-600">{t('history.failed')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-600">{totalRecords}/30</p>
            <p className="text-xs text-gray-600">{t('history.days')}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
      
      {/* Expandable Daily Records */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span>
            {t('history.viewDailyRecords', { count: totalRecords })}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {isExpanded && (
          <div className="bg-gray-50 max-h-64 overflow-y-auto">
            {sortedRecords.map((record, index) => (
              <DailyRecordItem key={index} record={record} language={language} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate overall stats
const calculateGoalStats = (cycles: Cycle[]) => {
  let totalCompleted = 0;
  let totalTracked = 0;
  let totalDays = 0;
  
  cycles.forEach(cycle => {
    cycle.dailyRecords.forEach(record => {
      totalDays++;
      if (record.status !== 'skipped') {
        totalTracked++;
        if (record.status === 'completed') {
          totalCompleted++;
        }
      }
    });
  });
  
  return {
    avgCompletion: totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : 0,
    cyclesCompleted: cycles.filter(c => c.status === 'finished').length,
    totalCycles: cycles.length,
    totalDays
  };
};

// Helper function to build cycles from votes (30-day periods) - same as in GeneralHistoryPage
const buildCyclesFromVotes = (votes: any[]): Cycle[] => {
  if (votes.length === 0) return [];
  
  const cycles: Cycle[] = [];
  const votesByDate = new Map<string, any>();
  
  votes.forEach(vote => {
    const dateStr = vote.date.toISOString().split('T')[0];
    votesByDate.set(dateStr, vote);
  });
  
  const firstDate = new Date(votes[0].date);
  const lastDate = new Date(votes[votes.length - 1].date);
  
  let cycleNumber = 1;
  let currentStart = new Date(firstDate);
  
  while (currentStart <= lastDate) {
    const cycleEnd = new Date(currentStart);
    cycleEnd.setDate(cycleEnd.getDate() + 29);
    
    const dailyRecords: DailyRecord[] = [];
    const cycleEndDate = cycleEnd > lastDate ? lastDate : cycleEnd;
    
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
  
  const sortedVotes = [...votes].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const vote of sortedVotes) {
    const voteDate = new Date(vote.date);
    voteDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - voteDate.getTime()) / (1000 * 60 * 60 * 24));
    
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

// (Removed unused generateMockGoalHistory function)

const GoalHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  
  const [goalHistory, setGoalHistory] = useState<UserGoalHistory | null>(
    // Initialize with state if available
    location.state?.goalHistory || null
  );
  const [loading, setLoading] = useState(!location.state?.goalHistory);
  
  useEffect(() => {
    const fetchGoalHistory = async () => {
      // Skip fetch if we already have data from navigation state
      if (goalHistory) {
        setLoading(false);
        return;
      }
      
      if (!id || !user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel for better performance
        const [goalDoc, votesSnapshot, subscriptionsSnapshot] = await Promise.all([
          getDoc(doc(db, 'goals', id)),
          getDocs(query(
            collection(db, 'votes'),
            where('userId', '==', user.uid),
            where('goalId', '==', id)
          )),
          getDocs(query(
            collection(db, 'subscriptions'),
            where('userId', '==', user.uid),
            where('goalId', '==', id)
          ))
        ]);
        
        if (!goalDoc.exists()) {
          console.error('Goal not found');
          setLoading(false);
          return;
        }
        
        const goalData = goalDoc.data();
        
        const votes = votesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
        })).sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const subscription = subscriptionsSnapshot.docs[0]?.data();
        
        // Build cycles from votes
        const cycles = buildCyclesFromVotes(votes);
        const currentStreak = calculateStreakFromVotes(votes);
        
        setGoalHistory({
          id: id,
          goalId: id,
          goalTitle: goalData.title || 'Untitled Goal',
          userId: user.uid,
          status: subscription?.status || 'active',
          currentStreak,
          joinedAt: subscription?.joinedAt?.toDate() || (votes[0]?.date || new Date()),
          cycles,
        });
      } catch (error) {
        console.error('Error fetching goal history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalHistory();
  }, [id, user]);

  const handleBack = () => {
    if (location.state?.from === 'general-history') {
      navigate('/history', { replace: false });
    } else if (location.state?.from === 'goal-detail') {
      // Use replace to avoid navigation stack issues
      navigate(`/goal/${id}`, { replace: true });
    } else {
      // Default fallback: go to general history page
      navigate('/history', { replace: false });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: t('nav.profile'), onClick: () => navigate('/profile') },
    { label: t('nav.history'), onClick: () => navigate('/history') },
    { label: t('nav.messages'), onClick: () => navigate('/messages') },
    { label: t('nav.settings'), onClick: () => navigate('/settings') },
    { label: t('auth.logout'), onClick: handleLogout, danger: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-primary transition-colors p-1"
              >
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

  if (!goalHistory) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-primary transition-colors p-1"
            >
              <ArrowLeft size={24} />
            </button>
            <Dropdown items={menuItems} />
          </div>
        </header>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-card">
            <p>{t('history.noHistory')}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateGoalStats(goalHistory.cycles);
  
  // Sort cycles in reverse chronological order (newest first)
  const sortedCycles = [...goalHistory.cycles].sort(
    (a, b) => b.cycleNumber - a.cycleNumber
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-primary transition-colors p-1"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-text">{goalHistory.goalTitle}</h1>
          </div>
          <Dropdown items={menuItems} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Overall Performance Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">{t('history.overallPerformance')}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.avgCompletion')}</p>
              <p className="text-2xl font-bold text-primary">{stats.avgCompletion}%</p>
            </div>
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.cyclesCompleted')}</p>
              <p className="text-2xl font-bold text-green-500">{stats.cyclesCompleted}</p>
            </div>
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.totalCycles')}</p>
              <p className="text-2xl font-bold text-blue-500">{stats.totalCycles}</p>
            </div>
            <div className="bg-white rounded-lg shadow-card p-4">
              <p className="text-sm text-gray-600">{t('history.totalDays')}</p>
              <p className="text-2xl font-bold text-purple-500">{stats.totalDays}</p>
            </div>
          </div>
        </section>

        {/* Cycles History Section */}
        <section>
          <h2 className="text-lg font-semibold text-text mb-4">{t('history.cyclesHistory')}</h2>
          
          {sortedCycles.length > 0 ? (
            <div className="space-y-4">
              {sortedCycles.map((cycle) => (
                <CycleCard key={cycle.cycleNumber} cycle={cycle} language={i18n.language} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-card">
              <p>{t('history.noCycles')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GoalHistoryPage;
