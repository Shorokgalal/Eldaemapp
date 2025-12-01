import React from 'react';
import Header from '../components/layout/Header';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';

const Messages: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{t('messages.title')}</h1>
        
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
          </div>
          <p className="text-gray-600 text-lg">{t('messages.comingSoon')}</p>
          <p className="text-sm text-gray-500 mt-2">
            We're working hard to bring you messaging features! 
          </p>
        </div>
      </div>
    </div>
  );
};

export default Messages;