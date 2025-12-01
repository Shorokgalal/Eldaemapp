import React from 'react';
import Header from '../components/layout/Header';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import { Globe, Bell, User, Info } from 'lucide-react';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n. changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
        
        <div className="space-y-4">
          {/* Language Settings */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-primary" size={24} />
              <h2 className="font-semibold text-lg">{t('settings. language')}</h2>
            </div>
            <div className="flex gap-3">
              <Button
                variant={i18n.language === 'en' ? 'primary' : 'ghost'}
                onClick={() => changeLanguage('en')}
              >
                {t('settings.english')}
              </Button>
              <Button
                variant={i18n. language === 'ar' ? 'primary' : 'ghost'}
                onClick={() => changeLanguage('ar')}
              >
                {t('settings.arabic')}
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-primary" size={24} />
              <h2 className="font-semibold text-lg">{t('settings.notifications')}</h2>
            </div>
            <p className="text-gray-600">Notification settings coming soon... </p>
          </div>

          {/* Account */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-primary" size={24} />
              <h2 className="font-semibold text-lg">{t('settings.account')}</h2>
            </div>
            <p className="text-gray-600">Account management coming soon...</p>
          </div>

          {/* About */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-primary" size={24} />
              <h2 className="font-semibold text-lg">{t('settings.about')}</h2>
            </div>
            <div className="space-y-2 text-gray-600">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>App:</strong> Eldaem App</p>
              <p className="text-sm mt-4">
                A goal tracking and community engagement platform. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;