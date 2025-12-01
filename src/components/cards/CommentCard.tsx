import React from 'react';
import { Heart, User } from 'lucide-react';
import { Reflection } from '../../types/reflection.types';
import { timeAgo } from '../../utils/date';
import clsx from 'clsx';

interface CommentCardProps {
  comment: Reflection;
  currentUserId: string;
  onLike: () => void;
  language?: string;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentUserId,
  onLike,
  language = 'en',
}) => {
  const isLiked = comment.likes.includes(currentUserId);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.userPhotoURL ? (
            <img
              src={comment.userPhotoURL}
              alt={comment.userName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={20} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text">{comment.userName}</p>
          <p className="text-gray-700 mt-1 whitespace-pre-wrap break-words">
            {comment. content}
          </p>
          
          {/* Footer */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{timeAgo(comment.createdAt, language)}</span>
            <button
              onClick={onLike}
              className={clsx(
                'flex items-center gap-1 transition-colors',
                isLiked ? 'text-error' : 'hover:text-error'
              )}
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-current' : ''}
              />
              <span>{comment.likes.length}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;