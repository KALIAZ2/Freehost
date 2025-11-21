import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Auth } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { authService } from './services/mockBackend';
import { User, RouteState } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<RouteState>({ view: 'home' });

  // Initialize auth
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser && route.view === 'home') {
        // Optional: Redirect to dashboard if already logged in on first load
        // setRoute({ view: 'dashboard' });
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setRoute({ view: 'dashboard' });
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setRoute({ view: 'home' });
  };

  const navigateTo = (view: RouteState['view'], siteId?: string) => {
    setRoute({ view, siteId });
  };

  // If we are in editor, we handle the layout differently (fullscreen, no navbar)
  if (route.view === 'editor' && route.siteId) {
      return (
          <Editor 
            siteId={route.siteId} 
            onBack={() => navigateTo('dashboard')} 
          />
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar 
        user={user} 
        onNavigate={(view) => navigateTo(view)} 
        onLogout={handleLogout}
        currentView={route.view}
      />
      
      <main>
        {route.view === 'home' && (
            <Home onStart={() => navigateTo(user ? 'dashboard' : 'register')} />
        )}

        {(route.view === 'login' || route.view === 'register') && (
            <Auth 
                mode={route.view} 
                onSuccess={handleLogin}
                onToggleMode={() => navigateTo(route.view === 'login' ? 'register' : 'login')}
            />
        )}

        {route.view === 'dashboard' && user && (
            <Dashboard 
                user={user} 
                onEditSite={(id) => navigateTo('editor', id)}
            />
        )}

        {/* Protection for auth routes */}
        {route.view === 'dashboard' && !user && (
            <div className="text-center py-20">
                <p className="text-lg text-slate-600">Veuillez vous connecter pour accéder au tableau de bord.</p>
                <button onClick={() => navigateTo('login')} className="mt-4 text-indigo-600 font-semibold hover:underline">Connexion</button>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;