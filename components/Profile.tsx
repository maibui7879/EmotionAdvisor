import React from 'react';
import { User, ColorTheme } from '../types';
import { Mail, Calendar, LogOut, Palette, Globe } from 'lucide-react';
import { Language, t } from '../i18n';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const colorOptions: { name: ColorTheme; bg: string }[] = [
    { name: 'green', bg: 'bg-green-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'orange', bg: 'bg-orange-500' },
]

const languageOptions: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'vi', label: 'Tiếng Việt' },
]

const Profile: React.FC<ProfileProps> = ({ user, onLogout, colorTheme, setColorTheme, language, setLanguage }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('profile.title', language)}</h1>
      <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-8">
        <div className="text-center">
            <img
            src={user.avatar}
            alt={user.name}
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary-500"
            />
            <h2 className="text-2xl font-bold">{user.name}</h2>
            
            <div className="mt-6 text-left space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail size={20} className="mr-3 text-primary-500"/>
                    <span>{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar size={20} className="mr-3 text-primary-500"/>
                    <span>{t('profile.createdAt', language)}: {new Date(user.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>
                </div>
            </div>
        </div>

        <div>
            <div className="flex items-center mb-4">
                <Palette size={20} className="mr-3 text-primary-500"/>
                <h3 className="text-xl font-semibold">{t('profile.color', language)}</h3>
            </div>
            <div className="flex space-x-4">
                {colorOptions.map(color => (
                    <button
                        key={color.name}
                        onClick={() => setColorTheme(color.name)}
                        className={`w-10 h-10 rounded-full ${color.bg} transition-transform transform hover:scale-110 ${colorTheme === color.name ? 'ring-4 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800' : ''}`}
                        aria-label={`Set theme to ${color.name}`}
                    />
                ))}
            </div>
        </div>

        <div>
            <div className="flex items-center mb-4">
                <Globe size={20} className="mr-3 text-primary-500"/>
                <h3 className="text-xl font-semibold">{t('profile.language', language)}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {languageOptions.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            language === lang.code
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
        
        <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
            <LogOut size={20} className="mr-2"/>
            {t('profile.logout', language)}
        </button>
      </div>
    </div>
  );
};

export default Profile;