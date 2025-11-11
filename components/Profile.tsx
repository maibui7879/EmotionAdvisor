import React from 'react';
import { User, ColorTheme } from '../types';
import { Mail, Calendar, LogOut, Palette } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const colorOptions: { name: ColorTheme; bg: string }[] = [
    { name: 'green', bg: 'bg-green-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'orange', bg: 'bg-orange-500' },
]

const Profile: React.FC<ProfileProps> = ({ user, onLogout, colorTheme, setColorTheme }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Profile & Settings</h1>
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
                    <span>Joined on {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>

        <div>
            <div className="flex items-center mb-4">
                <Palette size={20} className="mr-3 text-primary-500"/>
                <h3 className="text-xl font-semibold">Theme Color</h3>
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
        
        <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
            <LogOut size={20} className="mr-2"/>
            Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;