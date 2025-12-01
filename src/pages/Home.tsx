import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useGoals } from '../hooks/useGoals';
import Header from '../components/layout/Header';
import GoalCard from '../components/cards/GoalCard';
import QuestionCard from '../components/cards/QuestionCard';
import Loading from '../components/common/Loading';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { goals, subscribedGoalIds, loading } = useGoals(user?.uid);

  // Mock question data
  const mockQuestion = {
    id: '1',
    text: t('home.questions'),
    createdAt: new Date(),
    subscriberCount: 150,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Loading text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Pinned Questions Card */}
        <QuestionCard
          question={mockQuestion}
          onClick={() => navigate('/questions')}
        />

        {/* Goal Cards */}
        {goals.length > 0 ? (
          goals.map((goal) => {
            const isSubscribed = subscribedGoalIds.includes(goal.id);
            
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                isSubscribed={isSubscribed}
                onJoinClick={() => navigate(`/goal/${goal.id}/join`)}
                onClick={() => navigate(`/goal/${goal.id}`)}
                totalVotes={goal.totalVotes || 0}
                yesVotes={goal.yesVotes || 0}
                noVotes={goal.noVotes || 0}
              />
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-card">
            <p className="text-lg font-medium">No goals available yet. </p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
