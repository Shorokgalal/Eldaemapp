import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Dropdown from '../common/Dropdown';
import { ArrowLeft } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();

  // Determine if we're on a sub-page (not home)
  const isSubPage = location.pathname !== '/';

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return '';
    if (path === '/questions') return t('questions. title');
    if (path === '/profile') return t('profile.title');
    if (path === '/history') return t('history.title');
    if (path === '/messages') return t('messages.title');
    if (path === '/settings') return t('settings.title');
    if (path. startsWith('/goal/')) return t('goalDetails.title');
    return '';
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

  // Home page header (logo + menu)
  if (! isSubPage) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="text-xl font-bold text-primary cursor-pointer"
            onClick={() => navigate('/')}
          >
            EldaemApp
          </div>
          <Dropdown items={menuItems} />
        </div>
      </header>
    );
  }

  // Handle back button navigation
  const handleBack = () => {
    const path = location.pathname;
    
    // From history page, always go to home
    if (path === '/history') {
      navigate('/');
      return;
    }
    
    // For other pages, use browser back
    navigate(-1);
  };

  // Sub-page header (back arrow + title + menu)
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left side: Back arrow + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-primary transition-colors p-1"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-text">{getPageTitle()}</h1>
        </div>

        {/* Right side: 3 dots menu */}
        <Dropdown items={menuItems} />
      </div>
    </header>
  );
};

export default Header;
