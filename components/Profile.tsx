import React, { useState } from 'react';
import { User, ColorTheme } from '../types';
import { Mail, Calendar, LogOut, Palette, Globe, Edit2, Save, X, ChevronDown } from 'lucide-react';
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

const languageOptions: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
]

const Profile: React.FC<ProfileProps> = ({ user, onLogout, colorTheme, setColorTheme, language, setLanguage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedAvatar, setEditedAvatar] = useState<string>(user.avatar);

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: editedName,
      email: editedEmail,
    };
    localStorage.setItem('SybauSuzuka-user', JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-primary-600 dark:text-primary-400 mb-12">
          {t('profile.title', language)}
        </h1>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 md:p-12 mb-8">
          {/* Avatar Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={editedAvatar}
                alt={user.name}
                className="w-40 h-40 rounded-full mx-auto border-4 border-primary-500 shadow-lg object-cover"
              />

              {/* Avatar edit button */}
              <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  <i className="fas fa-pen-to-square text-sm"></i>
                </div>
              </label>
              <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  setEditedAvatar(result);
                };
                reader.readAsDataURL(f);
              }} />
            </div>
          </div>

          {/* User Info Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            {isEditing ? (
              // Edit Mode
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {language === 'vi' ? 'Tên' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {language === 'vi' ? 'Email' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 flex items-center justify-center px-6 py-3 font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-all transform hover:scale-105 shadow-md"
                  >
                    <Save size={20} className="mr-2" />
                    {language === 'vi' ? 'Lưu' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-all"
                  >
                    <X size={20} className="mr-2" />
                    {language === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-all transform hover:scale-110"
                      title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                    >
                      <Edit2 size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Mail size={24} className="text-primary-500 mr-4 flex-shrink-0"/>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{language === 'vi' ? 'Email' : 'Email'}</p>
                      <p className="text-gray-700 dark:text-gray-200">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Calendar size={24} className="text-primary-500 mr-4 flex-shrink-0"/>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('profile.createdAt', language)}</p>
                      <p className="text-gray-700 dark:text-gray-200">{new Date(user.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Color Theme Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full mr-3">
                <Palette size={24} className="text-primary-500"/>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('profile.color', language)}</h3>
            </div>
            <div className="flex justify-center gap-6">
              {colorOptions.map(color => (
                <button
                  key={color.name}
                  onClick={() => setColorTheme(color.name)}
                  className={`w-14 md:h-12 h-14 rounded-full ${color.bg} transition-all transform hover:scale-110 ${
                    colorTheme === color.name 
                      ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 shadow-lg scale-110' 
                      : 'shadow-md hover:shadow-lg'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Language Dropdown Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <Globe size={24} className="text-blue-500"/>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('profile.language', language)}</h3>
            </div>
            <div className="flex items-center gap-4 justify-center">
              {languageOptions.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all transform ${
                    language === lang.code
                      ? 'ring-2 ring-primary-500 scale-110 shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'
                  }`}
                  title={lang.label}
                >
                  <span>{lang.flag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center px-6 py-4 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          <LogOut size={24} className="mr-3"/>
          {t('profile.logout', language)}
        </button>
      </div>
    </div>
  );
};

export default Profile;