import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeInput } from '../../utils/sanitize';

interface ReflectionFormProps {
  showQuantity: boolean;
  onSubmit: (content: string, quantity?: number) => void;
  onCancel: () => void;
}

const ReflectionForm: React.FC<ReflectionFormProps> = ({
  showQuantity,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const sanitizedContent = content.trim() ? sanitizeInput(content) : '';
    const quantityNum = showQuantity && quantity ? parseInt(quantity) : undefined;

    onSubmit(sanitizedContent, quantityNum);
    setContent('');
    setQuantity('');
    setError('');
  };

  const handleSkip = () => {
    onSubmit('', showQuantity && quantity ? parseInt(quantity) : undefined);
    setContent('');
    setQuantity('');
    setError('');
  };

  return (
    <div className="bg-gray-50 rounded-lg px-4 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            {showQuantity ? '🎉 Great job!' : '💪 Keep going!'}
          </p>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            ✕
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-3">Record your performance</p>
          
          {showQuantity && (
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts... (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            maxLength={2000}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            {t('common.submit')}
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionForm;