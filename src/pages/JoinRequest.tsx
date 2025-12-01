import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, addDoc, collection, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import JoinRequestForm from '../components/forms/JoinRequestForm';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { ArrowLeft } from 'lucide-react';

const JoinRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [goal, setGoal] = React. useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React. useState(false);

  React. useEffect(() => {
    const fetchGoal = async () => {
      if (!id) return;
      
      const goalDoc = await getDoc(doc(db, 'goals', id));
      if (goalDoc.exists()) {
        setGoal({ id: goalDoc.id, ... goalDoc.data() });
      }
      setLoading(false);
    };

    fetchGoal();
  }, [id]);

  const handleSubmit = async (answers: { why: string; when: string; what: string }) => {
    if (!user || !id) return;

    setSubmitting(true);

    try {
      const now = new Date();
      
      // Create subscription with cycle information
      await addDoc(collection(db, 'subscriptions'), {
        userId: user.uid,
        goalId: id,
        joinedAt: now,
        status: 'active',
        currentCycle: 1,
        cycleStartDate: now,
        joinAnswers: answers,
      });

      // Update goal subscriber count
      await updateDoc(doc(db, 'goals', id), {
        subscriberCount: increment(1),
      });

      // Navigate to goal details
      navigate(`/goal/${id}`);
    } catch (error) {
      console.error('Error joining goal:', error);
      alert('Failed to join goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Loading />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto p-4 text-center py-12">
          <p className="text-error">Goal not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
        >
          <ArrowLeft size={20} />
          {t('common.back')}
        </button>

        <div className="bg-white rounded-lg shadow-card p-6 space-y-6">
          <h1 className="text-3xl font-bold text-text text-center">
            {goal.name}
          </h1>
          
          <p className="text-gray-600 leading-relaxed">
            {goal.description}
          </p>

          {submitting ? (
            <Loading text="Joining goal..." />
          ) : (
            <JoinRequestForm onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRequest;