import React from 'react';
import { Database, LogOut, User as UserIcon, Cloud } from 'lucide-react';
import { User, View } from '../types';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  currentView: View;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, currentView }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg mr-2">
                <Database className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FreeHost</span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate('home')} 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Accueil
            </button>
            
            {user ? (
              <>
                 <button 
                  onClick={() => onNavigate('dashboard')} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Tableau de bord
                </button>
                <div className="flex items-center pl-4 border-l border-slate-200 ml-2 space-x-3">
                   <div className="flex items-center text-sm font-medium text-slate-700">
                      {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full mr-2" />
                      ) : (
                          <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-xs font-bold">
                              {user.name.charAt(0)}
                          </div>
                      )}
                      <span className="hidden sm:block">{user.name}</span>
                      {user.isGoogleConnected && <Cloud className="w-3 h-3 ml-1 text-blue-500" />}
                   </div>
                   <button 
                    onClick={onLogout}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                    title="Se déconnecter"
                   >
                     <LogOut className="h-4 w-4" />
                   </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow"
                >
                  Commencer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};