import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeInput } from '../../utils/sanitize';

interface RenewalFormProps {
  goalTitle: string;
  onSubmit: (data: {
    cycleWhy: string;
    workSchedule: string;
    goals: string;
  }) => void;
  onCancel?: () => void;
}

const RenewalForm: React.FC<RenewalFormProps> = ({
  goalTitle,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [cycleWhy, setCycleWhy] = useState('');
  const [workSchedule, setWorkSchedule] = useState('');
  const [goals, setGoals] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!cycleWhy.trim()) {
      newErrors.cycleWhy = t('renewal.errorRequired');
    } else if (cycleWhy.trim().length < 10) {
      newErrors.cycleWhy = t('renewal.errorTooShort');
    }

    if (!workSchedule.trim()) {
      newErrors.workSchedule = t('renewal.errorRequired');
    } else if (workSchedule.trim().length < 10) {
      newErrors.workSchedule = t('renewal.errorTooShort');
    }

    if (!goals.trim()) {
      newErrors.goals = t('renewal.errorRequired');
    } else if (goals.trim().length < 10) {
      newErrors.goals = t('renewal.errorTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        cycleWhy: sanitizeInput(cycleWhy),
        workSchedule: sanitizeInput(workSchedule),
        goals: sanitizeInput(goals),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-white rounded-lg shadow-card p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text mb-2">
              🎉 {t('renewal.title')}
            </h1>
            <p className="text-gray-600 mb-4">
              {t('renewal.subtitle')}
            </p>
            <p className="text-lg font-semibold text-primary">
              {goalTitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question 1: Why this cycle? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('renewal.question1')} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t('renewal.question1Hint')}
              </p>
              <textarea
                value={cycleWhy}
                onChange={(e) => setCycleWhy(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                  errors.cycleWhy ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                maxLength={1000}
                placeholder={t('renewal.question1Placeholder')}
              />
              {errors.cycleWhy && (
                <p className="text-sm text-red-500 mt-1">{errors.cycleWhy}</p>
              )}
            </div>

            {/* Question 2: When will you work? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('renewal.question2')} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t('renewal.question2Hint')}
              </p>
              <textarea
                value={workSchedule}
                onChange={(e) => setWorkSchedule(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                  errors.workSchedule ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                maxLength={1000}
                placeholder={t('renewal.question2Placeholder')}
              />
              {errors.workSchedule && (
                <p className="text-sm text-red-500 mt-1">{errors.workSchedule}</p>
              )}
            </div>

            {/* Question 3: What to achieve? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('renewal.question3')} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t('renewal.question3Hint')}
              </p>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                  errors.goals ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                maxLength={1000}
                placeholder={t('renewal.question3Placeholder')}
              />
              {errors.goals && (
                <p className="text-sm text-red-500 mt-1">{errors.goals}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
              )}
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                {t('renewal.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RenewalForm;
