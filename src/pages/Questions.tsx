import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import CommentCard from '../components/cards/CommentCard';
import QuestionResponseForm from '../components/forms/QuestionResponseForm';
import Loading from '../components/common/Loading';
import Dropdown from '../components/common/Dropdown';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Question, QuestionResponse } from '../types/reflection.types';

const Questions: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const questionsQuery = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(questionsQuery, (snapshot) => {
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc. id,
        ...doc.data(),
        createdAt: doc.data(). createdAt?. toDate(),
      })) as Question[];

      setQuestions(questionsData);
      if (questionsData.length > 0 && !selectedQuestion) {
        setSelectedQuestion(questionsData[0]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (! selectedQuestion) return;

    const responsesQuery = query(
      collection(db, 'questionResponses'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(responsesQuery, (snapshot) => {
      const responsesData = snapshot. docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        .filter((r: any) => r.questionId === selectedQuestion.id) as QuestionResponse[];

      setResponses(responsesData);
    });

    return unsubscribe;
  }, [selectedQuestion]);

  const handleSubmitResponse = async (content: string) => {
    if (!user || !selectedQuestion) return;

    try {
      await addDoc(collection(db, 'questionResponses'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL,
        questionId: selectedQuestion. id,
        content,
        createdAt: new Date(),
        likes: [],
      });
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response.  Please try again.');
    }
  };

  const handleLike = async (responseId: string) => {
    console.log('Like response:', responseId);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: t('nav.profile'), onClick: () => navigate('/profile') },
    { label: t('nav.history'), onClick: () => navigate('/history') },
    { label: t('nav.messages'), onClick: () => navigate('/messages') },
    { label: t('nav.settings'), onClick: () => navigate('/settings') },
    { label: t('auth.logout'), onClick: handleLogout, danger: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Sub-header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-primary transition-colors p-1">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-text">{t('questions.title')}</h1>
            </div>
            <Dropdown items={menuItems} />
          </div>
        </header>
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sub-header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-primary transition-colors p-1"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-text">{t('questions.title')}</h1>
          </div>
          <Dropdown items={menuItems} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Question Selector */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">
                {selectedQuestion?. text || t('questions.selectQuestion')}
              </span>
              <ChevronDown size={20} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-10">
                {questions. map((question) => (
                  <button
                    key={question.id}
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {question.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Responses Feed */}
        <div className="p-4 space-y-4 pb-32">
          {responses.length > 0 ? (
            responses.map((response) => (
              <CommentCard
                key={response.id}
                comment={response as any}
                currentUserId={user?.uid || ''}
                onLike={() => handleLike(response.id)}
                language={i18n.language}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No responses yet. </p>
              <p className="text-sm mt-2">Be the first to respond!</p>
            </div>
          )}
        </div>

        {/* Response Form */}
        <div className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto">
          <QuestionResponseForm onSubmit={handleSubmitResponse} />
        </div>
      </div>
    </div>
  );
};

export default Questions;
