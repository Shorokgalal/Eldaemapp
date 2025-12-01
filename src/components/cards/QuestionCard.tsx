import React from 'react';
import { useTranslation } from 'react-i18next';
import { Question } from '../../types/reflection.types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

const QuestionCard: React. FC<QuestionCardProps> = ({ question, onClick }) => {
  const { t } = useTranslation();

  return (
    <div
      className="bg-white rounded-lg shadow-card p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ring-2 ring-primary"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">{t('home.questions')}</h3>
        <span className="text-sm text-gray-600">
          {question.subscriberCount} {t('home.subscribers')}
        </span>
      </div>
    </div>
  );
};

export default QuestionCard;