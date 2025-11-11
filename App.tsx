
import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import EmotionHistory from './components/EmotionHistory';
import ScheduleTimetable from './components/ScheduleTimetable';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import { Theme, User, Page, Notification as NotificationType, ColorTheme } from './types';
import { Moon, Sun, LayoutDashboard, MessageSquare, History, Calendar, User as UserIcon, Bell } from 'lucide-react';
import NotificationContainer from './components/common/NotificationContainer';
import { Language, t } from './i18n';

const colorThemes: Record<ColorTheme, Record<string, string>> = {
  green: { '--color-primary-500': '16 185 129', '--color-primary-600': '5 150 105' /* ... add all shades */ },
  blue: { '--color-primary-500': '59 130 246', '--color-primary-600': '37 99 235' /* ... */ },
  purple: { '--color-primary-500': '139 92 246', '--color-primary-600': '124 58 237' /* ... */ },
  orange: { '--color-primary-500': '249 115 22', '--color-primary-600': '234 88 12' /* ... */ },
};

const fullColorPalettes: Record<ColorTheme, Record<string, string>> = {
    green: { '50': '236 253 245', '100': '209 250 229', '200': '167 243 208', '300': '110 231 183', '400': '52 211 153', '500': '16 185 129', '600': '5 150 105', '700': '4 120 87', '800': '6 95 70', '900': '6 78 59', '950': '2 44 34' },
    blue: { '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253', '400': '96 165 250', '500': '59 130 246', '600': '37 99 235', '700': '29 78 216', '800': '30 64 175', '900': '30 58 138', '950': '23 37 84' },
    purple: { '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149', '950': '46 16 101' },
    orange: { '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116', '400': '251 146 60', '500': '249 115 22', '600': '234 88 12', '700': '194 65 12', '800': '154 52 18', '900': '124 45 18', '950': '69 25 8' },
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => (localStorage.getItem('colorTheme') as ColorTheme) || 'green');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('SybauSuzuka-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentPage, setCurrentPage] = useState<Page>('chat');
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const palette = fullColorPalettes[colorTheme];
    for (const [shade, value] of Object.entries(palette)) {
        root.style.setProperty(`--color-primary-${shade}`, value as string);
    }
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);
  
  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications([{ id, message, type }]); // Only keep 1 notification at a time
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if(user){
      addNotification(t('login.welcome', language, { name: user.name }), 'info');
    }
  }, [user, addNotification, language]);

  const handleLogin = (name: string) => {
    const newUser: User = {
      id: '1',
      name,
      email: `${name.toLowerCase()}@example.com`,
      avatar: `https://i.pravatar.cc/150?u=${name}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('SybauSuzuka-user', JSON.stringify(newUser));
    setUser(newUser);
    setCurrentPage('chat'); // Go directly to chat after login
  };
  
  const handleLogout = () => {
    localStorage.removeItem('SybauSuzuka-user');
    setUser(null);
    setCurrentPage('dashboard');
  }

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const NavItem: React.FC<{ page: Page; icon: React.ReactNode; label: string, isMobile?: boolean }> = ({ page, icon, label, isMobile }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex ${isMobile ? 'flex-col items-center justify-center' : 'items-center space-x-3 p-3'} rounded-lg w-full text-left transition-all duration-300 ${
        currentPage === page
          ? 'bg-primary-500 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className={`font-medium ${isMobile ? 'text-xs' : ''}`}>{label}</span>
    </button>
  );

  const BottomNav: React.FC = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center p-2 z-40 overflow-x-auto">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
            currentPage === 'dashboard'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Dashboard"
        >
          <LayoutDashboard size={24} />
        </button>
        <button
          onClick={() => setCurrentPage('chat')}
          className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
            currentPage === 'chat'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
        <button
          onClick={() => setCurrentPage('schedule')}
          className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
            currentPage === 'schedule'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Schedule"
        >
          <Calendar size={24} />
        </button>
        <button
          onClick={() => setCurrentPage('history')}
          className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
            currentPage === 'history'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="History"
        >
          <History size={24} />
        </button>
        <button
          onClick={() => setCurrentPage('notifications')}
          className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
            currentPage === 'notifications'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Notifications"
        >
          <Bell size={24} />
        </button>
        <button
          onClick={() => setCurrentPage('profile')}
          className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
            currentPage === 'profile'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Profile"
        >
          <UserIcon size={24} />
        </button>
    </nav>
  );


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">{t('app.title', language)}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{t('app.subtitle', language)}</p>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(e.currentTarget.username.value); }}>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 text-gray-900 bg-gray-100 border-2 border-transparent rounded-lg dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('login.placeholder', language)}
              />
            </div>
            <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform transform hover:scale-105">
              {t('login.button', language)}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} language={language} onNavigate={(p: Page) => setCurrentPage(p)} />;
      case 'chat':
        return <Chat addNotification={addNotification} language={language} />;
      case 'history':
        return <EmotionHistory language={language} />;
      case 'schedule':
        return <ScheduleTimetable addNotification={addNotification} language={language} />;
      case 'notifications':
        return <Notifications notifications={notifications} onClear={clearAllNotifications} language={language} />;
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} colorTheme={colorTheme} setColorTheme={setColorTheme} language={language} setLanguage={setLanguage} />;
      default:
        return <Chat addNotification={addNotification} language={language} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      <aside className="hidden md:flex w-64 p-6 bg-white dark:bg-gray-800 shadow-lg flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">SybauSuzuka</h1>
          </div>
          <nav className="space-y-2">
            <NavItem page="dashboard" icon={<LayoutDashboard size={20} />} label={t('nav.dashboard', language)} />
            <NavItem page="chat" icon={<MessageSquare size={20} />} label={t('nav.chat', language)} />
            <NavItem page="history" icon={<History size={20} />} label={t('nav.history', language)} />
            <NavItem page="notifications" icon={<Bell size={20} />} label={t('nav.notifications', language)} />
            <NavItem page="schedule" icon={<Calendar size={20} />} label={t('nav.schedule', language)} />
            <NavItem page="profile" icon={<UserIcon size={20} />} label={t('nav.profile', language)} />
          </nav>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'light' ? <Moon /> : <Sun />}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-2 md:p-6 lg:p-10 overflow-y-auto pb-20 md:pb-6 lg:pb-10">
        {renderPage()}
      </main>
      <BottomNav />
    </div>
  );
};

export default App;
