import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import { sanitizeInput } from '../../utils/sanitize';

interface QuestionResponseFormProps {
  onSubmit: (content: string) => void;
}

const QuestionResponseForm: React.FC<QuestionResponseFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) {
      setError(t('common.error'));
      return;
    }

    onSubmit(sanitizeInput(content));
    setContent('');
    setError('');
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-card sticky bottom-0">
      <Textarea
        value={content}
        onChange={setContent}
        placeholder={t('questions.writeResponse')}
        rows={4}
        maxLength={2000}
        error={error}
        className="mb-3"
      />

      <Button variant="primary" onClick={handleSubmit} fullWidth>
        {t('questions.submit')}
      </Button>
    </div>
  );
};

export default QuestionResponseForm;