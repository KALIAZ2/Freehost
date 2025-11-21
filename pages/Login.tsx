import React, { useState } from 'react';
import { authService } from '../services/mockBackend';
import { User, View } from '../types';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'register';
  onSuccess: (user: User) => void;
  onToggleMode: () => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, onSuccess, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const user = authService.login(email);
      if (user) {
        onSuccess(user);
      } else {
        setError('Compte introuvable. Veuillez vérifier votre email ou créer un compte.');
      }
    } else {
      if (!name) {
         setError('Le nom est requis.');
         return;
      }
      const user = authService.register(name, email);
      onSuccess(user);
    }
  };

  const handleGoogleLogin = async () => {
      setIsLoading(true);
      try {
          const user = await authService.googleLogin();
          onSuccess(user);
      } catch (e) {
          setError("Erreur de connexion Google.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Hébergez vos sites via Drive ou Localement
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
            </div>
          )}
          
          <div className="mb-6">
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
                {isLoading ? <Loader className="h-5 w-5 mr-2 animate-spin" /> : 
                <img src="https://www.gstatic.com/images/branding/product/1x/google_g_48dp.png" alt="Google" className="h-5 w-5 mr-2" />}
                {mode === 'login' ? 'Continuer avec Google' : "S'inscrire avec Google"}
            </button>
          </div>

          <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                   <span className="px-2 bg-white text-slate-500">Ou avec email (Mode Local)</span>
                </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Nom complet
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Adresse Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md p-2 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
             <p className="text-sm text-slate-600">
                {mode === 'login' ? "Pas encore de compte ?" : "Déjà inscrit ?"}
                <button onClick={onToggleMode} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                   {mode === 'login' ? "S'inscrire gratuitement" : "Se connecter"}
                </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};