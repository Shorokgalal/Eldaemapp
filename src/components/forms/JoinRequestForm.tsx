import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import { sanitizeInput } from '../../utils/sanitize';
import { validateRequired } from '../../utils/validation';

interface JoinRequestFormProps {
  onSubmit: (answers: { why: string; when: string; what: string }) => void;
}

const JoinRequestForm: React.FC<JoinRequestFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [why, setWhy] = useState('');
  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    const whyValidation = validateRequired(why, 'Why');
    if (! whyValidation. valid) newErrors.why = whyValidation.message! ;
    
    const whenValidation = validateRequired(when, 'When');
    if (!whenValidation.valid) newErrors.when = whenValidation.message!;
    
    const whatValidation = validateRequired(what, 'What');
    if (!whatValidation.valid) newErrors.what = whatValidation.message!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      why: sanitizeInput(why),
      when: sanitizeInput(when),
      what: sanitizeInput(what),
    });
  };

  if (! showForm) {
    return (
      <Button
        variant="primary"
        fullWidth
        onClick={() => setShowForm(true)}
      >
        {t('joinRequest.requestButton')}
      </Button>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <Textarea
        label={t('joinRequest.why')}
        value={why}
        onChange={setWhy}
        placeholder={t('joinRequest.whyPlaceholder')}
        error={errors.why}
        required
        rows={4}
        maxLength={500}
      />

      <Textarea
        label={t('joinRequest.when')}
        value={when}
        onChange={setWhen}
        placeholder={t('joinRequest.whenPlaceholder')}
        error={errors. when}
        required
        rows={3}
        maxLength={300}
      />

      <Textarea
        label={t('joinRequest.what')}
        value={what}
        onChange={setWhat}
        placeholder={t('joinRequest.whatPlaceholder')}
        error={errors.what}
        required
        rows={4}
        maxLength={500}
      />

      <Button
        variant="primary"
        fullWidth
        onClick={handleSubmit}
      >
        {t('joinRequest.submit')}
      </Button>
    </div>
  );
};

export default JoinRequestForm;