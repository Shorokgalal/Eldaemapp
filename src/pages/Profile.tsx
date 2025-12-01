import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import Dropdown from '../components/common/Dropdown';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    goalsJoined: 0,
    reflections: 0,
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const subscriptionsQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const goalsJoined = subscriptionsSnapshot.size;

        const reflectionsQuery = query(
          collection(db, 'reflections'),
          where('userId', '==', user.uid)
        );
        const reflectionsSnapshot = await getDocs(reflectionsQuery);
        const reflections = reflectionsSnapshot.size;

        const votesQuery = query(
          collection(db, 'votes'),
          where('userId', '==', user.uid)
        );
        const votesSnapshot = await getDocs(votesQuery);
        const totalVotes = votesSnapshot.size;

        setStats({ goalsJoined, reflections, totalVotes });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: t('nav.history'), onClick: () => navigate('/history') },
    { label: t('nav.messages'), onClick: () => navigate('/messages') },
    { label: t('nav.settings'), onClick: () => navigate('/settings') },
    { label: t('auth.logout'), onClick: handleLogout, danger: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-primary transition-colors p-1">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-text">{t('profile.title')}</h1>
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
            <h1 className="text-lg font-bold text-text">{t('profile. title')}</h1>
          </div>
          <Dropdown items={menuItems} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-card p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            {user?. photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={40} className="text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{user?.displayName}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.goalsJoined}</p>
              <p className="text-sm text-gray-600 mt-1">{t('profile.goalsJoined')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.reflections}</p>
              <p className="text-sm text-gray-600 mt-1">{t('profile.reflections')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalVotes}</p>
              <p className="text-sm text-gray-600 mt-1">{t('profile.totalVotes')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
