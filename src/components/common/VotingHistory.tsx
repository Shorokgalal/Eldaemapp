import React from 'react';
import { useTranslation } from 'react-i18next';
import { VoteHistoryItem } from '../../types/goal.types';

interface VotingHistoryProps {
  votes: VoteHistoryItem[];
  maxDays?: number;
}

const VotingHistory: React.FC<VotingHistoryProps> = ({ votes, maxDays = 30 }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // votes array comes in chronologically: [oldest...newest]
  // We want to display left-to-right: Day 1 (oldest) on left, Day 30 (newest) on right
  // So we DON'T reverse for LTR, we DO reverse for RTL (because RTL flex will reverse it back)
  const displayVotes = votes.slice(0, maxDays);
  
  // DEBUG: Log the order
  React.useEffect(() => {
    console.log('=== VOTING HISTORY DEBUG ===');
    console.log('Language:', i18n.language, 'isRTL:', isRTL);
    console.log('Input votes (first 3):');
    displayVotes.slice(0, 3).forEach((v, i) => {
      console.log(`  Index ${i}: ${v.date.toLocaleDateString()} - ${v.vote}`);
    });
    console.log('Input votes (last 3):');
    displayVotes.slice(-3).forEach((v, i) => {
      const actualIndex = displayVotes.length - 3 + i;
      console.log(`  Index ${actualIndex}: ${v.date.toLocaleDateString()} - ${v.vote}`);
    });
  }, [displayVotes, i18n.language, isRTL]);

  const getColor = (vote: 'yes' | 'no' | 'none') => {
    switch (vote) {
      case 'yes':
        return 'bg-green-500'; // Green for yes
      case 'no':
        return 'bg-red-500'; // Red for no
      case 'none':
        return 'bg-gray-300'; // Gray for not voted
    }
  };

  return (
    <div className="p-4">
      {/* Force LTR layout by completely overriding any RTL styles */}
      <div 
        dir="ltr"
        style={{ 
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '4px',
          direction: 'ltr'
        }}
      >
        {displayVotes.map((item, index) => {
          // Day 1 = index 0 (leftmost), Day 30 = index 29 (rightmost)
          const dayNumber = index + 1;
          return (
            <div
              key={index}
              data-day={dayNumber}
              className={`rounded ${getColor(item.vote)}`}
              title={`Day ${dayNumber}: ${item.date.toLocaleDateString()} - ${item.vote === 'yes' ? 'Completed' : item.vote === 'no' ? 'Failed' : 'Not voted'}`}
              style={{ 
                width: '20px',
                height: '20px',
                flexShrink: 0,
                order: index
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VotingHistory;