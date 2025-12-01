import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import ReflectionForm from '../forms/ReflectionForm';

interface BottomActionBarProps {
  question: string;
  onVote: (vote: 'yes' | 'no', content: string, quantity?: number) => void;
  hasVotedToday?: boolean;
  todayVoteType?: 'yes' | 'no';
  canAddReflection?: boolean;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({ 
  question, 
  onVote,
  hasVotedToday = false,
  todayVoteType,
  canAddReflection = false,
}) => {
  const { t } = useTranslation();
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);
  const [showReflection, setShowReflection] = useState(false);

  // Sync local state with props
  useEffect(() => {
    if (hasVotedToday && todayVoteType) {
      setVoted(todayVoteType);
      setShowReflection(false);
    }
  }, [hasVotedToday, todayVoteType]);

  const handleVoteClick = (vote: 'yes' | 'no') => {
    setVoted(vote);
    setShowReflection(false);
  };

  const handleWellDoneClick = () => {
    setShowReflection(true);
  };

  const handleReflectionSubmit = (content: string, quantity?: number) => {
    onVote(voted!, content, quantity);
    // Don't reset state - let the parent component handle it
  };

  const handleReflectionCancel = () => {
    setShowReflection(false);
    // If already voted today, keep the voted state
    if (!hasVotedToday) {
      setVoted(null);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 pb-[env(safe-area-inset-bottom)]">
        {/* Already voted today - show reflection option if hasn't added one yet */}
        {hasVotedToday && canAddReflection && !showReflection && (
          <div className="bg-gray-50 rounded-lg px-4 py-4">
            <p className="text-sm text-gray-600 mb-3 text-center">
              ✅ {t('voting.votedToday')}
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={handleWellDoneClick}
            >
              {t('voting.addReflection')}
            </Button>
          </div>
        )}

        {/* Already voted today and added reflection - show status */}
        {hasVotedToday && !canAddReflection && (
          <div className="bg-gray-50 rounded-lg px-4 py-4 text-center">
            <p className="text-sm font-medium text-gray-700">
              ✅ {t('voting.allDoneToday')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t('voting.comeBackTomorrow')}
            </p>
          </div>
        )}

        {/* Haven't voted today - show vote buttons */}
        {!hasVotedToday && !voted && (
          <div className="bg-gray-50 rounded-lg px-4 py-4 flex items-center justify-between">
            <p className="flex-1 text-sm font-medium text-gray-700 pr-4">{question}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { handleVoteClick('yes'); handleWellDoneClick(); }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                aria-label="Yes"
              >
                <Check size={24} />
              </button>
              <button
                type="button"
                onClick={() => { handleVoteClick('no'); handleWellDoneClick(); }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                aria-label="No"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Voted just now (local state) - show well done button */}
        {!hasVotedToday && voted && !showReflection && (
          <Button
            variant="success"
            fullWidth
            onClick={handleWellDoneClick}
          >
            {t('goalDetails.wellDone')} {voted === 'yes' && `- ${t('goalDetails.quantity')}`}
          </Button>
        )}

        {/* Show reflection form */}
        {showReflection && (
          <ReflectionForm
            showQuantity={voted === 'yes'}
            onSubmit={handleReflectionSubmit}
            onCancel={handleReflectionCancel}
          />
        )}
      </div>
    </div>
  );
};

export default BottomActionBar;