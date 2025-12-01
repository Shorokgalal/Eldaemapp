import React from 'react';
import { useTranslation } from 'react-i18next';
import { Goal } from '../../types/goal.types';

interface GoalCardProps {
  goal: Goal;
  isSubscribed: boolean;
  onJoinClick: () => void;
  onClick: () => void;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
}

const GoalCard: React. FC<GoalCardProps> = ({
  goal,
  isSubscribed,
  onJoinClick,
  onClick,
  totalVotes,
  yesVotes,
  noVotes,
}) => {
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    if (!isSubscribed) {
      e.stopPropagation();
      onJoinClick();
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-card p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      {/* Goal Header */}
      <div className="mb-4">
        {/* Show icon and category if available */}
        {(goal.icon || goal.category) && (
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
            {goal.icon && <span>{goal.icon}</span>}
            {goal.category && <span className="capitalize">{goal.category}</span>}
          </div>
        )}
        
        <h2 className="text-xl font-bold text-text mb-2">
          {goal.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-2">
          {goal.description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        {/* Subscriber Count */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">{goal.subscriberCount}</span>
          <span>{t('home.subscribers')}</span>
        </div>

        {/* Vote Stats or Join Button */}
        {isSubscribed ?  (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">{t('home.totalVotes')}:</span>
              <span className="text-gray-600">{totalVotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-success">{t('home.yesVotes')}:</span>
              <span className="text-success">{yesVotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-error">{t('home.noVotes')}:</span>
              <span className="text-error">{noVotes}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e. stopPropagation();
              onJoinClick();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {t('home.tapToJoin')}
          </button>
        )}
      </div>
    </div>
  );
};

export default GoalCard;