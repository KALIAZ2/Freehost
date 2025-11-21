import React from 'react';
import { Globe, Database, Shield, Code, CheckCircle, Cloud, HardDrive } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 py-20 lg:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 mb-8">
            <Cloud className="w-4 h-4 mr-2" />
            Nouveau : Intégration Google Drive native
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Hébergez vos sites <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">directement depuis Drive</span>
          </h1>
          <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Transformez vos fichiers HTML/CSS stockés sur Google Drive en sites web performants. 
            Synchronisation automatique, SSL gratuit et zéro configuration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onStart}
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-slate-900 bg-white hover:bg-slate-50 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" alt="Drive" className="w-6 h-6 mr-2" />
              Connecter Google Drive
            </button>
            <button 
              onClick={onStart}
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 text-lg font-medium rounded-lg text-white bg-transparent hover:bg-slate-800 transition-all"
            >
              Stockage Local (PC)
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Comment ça marche ?</h2>
            <p className="mt-4 text-lg text-slate-600">Trois étapes simples pour mettre votre site en ligne.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="relative">
                <div className="absolute top-0 left-0 -ml-4 -mt-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">1</div>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 h-full">
                    <Cloud className="h-10 w-10 text-blue-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Connectez votre Cloud</h3>
                    <p className="text-slate-600">Liez votre compte Google Drive ou utilisez le stockage local de votre navigateur. Nous créons un dossier dédié sécurisé.</p>
                </div>
             </div>
             <div className="relative">
                <div className="absolute top-0 left-0 -ml-4 -mt-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">2</div>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 h-full">
                    <Code className="h-10 w-10 text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Déposez vos fichiers</h3>
                    <p className="text-slate-600">Glissez-déposez vos fichiers HTML, CSS et JS. Modifiez-les directement avec notre éditeur en ligne ou WYSIWYG.</p>
                </div>
             </div>
             <div className="relative">
                <div className="absolute top-0 left-0 -ml-4 -mt-4 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">3</div>
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 h-full">
                    <Globe className="h-10 w-10 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-3">En ligne instantanément</h3>
                    <p className="text-slate-600">Votre site reçoit une URL unique sécurisée (HTTPS). Chaque sauvegarde sur Drive met à jour le site.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Une suite complète pour développeurs</h2>
                <div className="space-y-6">
                   <div className="flex">
                      <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 flex-shrink-0" />
                      <div>
                         <h4 className="font-bold text-slate-900">Architecture Hybride</h4>
                         <p className="text-slate-600">Commencez en local pour tester, puis synchronisez sur Google Drive pour la production.</p>
                      </div>
                   </div>
                   <div className="flex">
                      <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 flex-shrink-0" />
                      <div>
                         <h4 className="font-bold text-slate-900">Éditeur Intelligent</h4>
                         <p className="text-slate-600">Codez en direct ou utilisez le mode visuel (WYSIWYG) pour des modifications rapides sans code.</p>
                      </div>
                   </div>
                   <div className="flex">
                      <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 flex-shrink-0" />
                      <div>
                         <h4 className="font-bold text-slate-900">Versionning Simplifié</h4>
                         <p className="text-slate-600">Revenez facilement à une version précédente de votre site si vous faites une erreur.</p>
                      </div>
                   </div>
                   <div className="flex">
                      <CheckCircle className="h-6 w-6 text-emerald-500 mr-4 flex-shrink-0" />
                      <div>
                         <h4 className="font-bold text-slate-900">Sécurité Maximale</h4>
                         <p className="text-slate-600">Scan anti-malware automatique à l'upload et certificats SSL gérés par Cloudflare.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-white p-2 rounded-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                   <div className="flex items-center px-4 py-2 bg-slate-900 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   </div>
                   <div className="p-6 font-mono text-sm text-blue-300">
                      <p><span className="text-purple-400">const</span> <span className="text-yellow-300">site</span> = <span className="text-blue-300">new</span> Site({'{'}</p>
                      <p className="pl-4">provider: <span className="text-green-400">'google_drive'</span>,</p>
                      <p className="pl-4">ssl: <span className="text-orange-400">true</span>,</p>
                      <p className="pl-4">status: <span className="text-green-400">'deployed'</span></p>
                      <p>{'}'});</p>
                      <p className="mt-4 text-slate-500">// Synchronisation en cours...</p>
                      <p className="text-green-400">✔ Upload vers Drive réussi</p>
                      <p className="text-green-400">✔ Site actif sur https://mon-site.freehost.app</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                 <div className="text-4xl font-bold text-indigo-400 mb-2">15k+</div>
                 <div className="text-slate-400">Sites Hébergés</div>
              </div>
              <div>
                 <div className="text-4xl font-bold text-blue-400 mb-2">50TB</div>
                 <div className="text-slate-400">Données sur Drive</div>
              </div>
              <div>
                 <div className="text-4xl font-bold text-emerald-400 mb-2">99.9%</div>
                 <div className="text-slate-400">Uptime</div>
              </div>
              <div>
                 <div className="text-4xl font-bold text-purple-400 mb-2">Free</div>
                 <div className="text-slate-400">Pour toujours</div>
              </div>
           </div>
        </div>
      </section>
      
       <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
             <span className="text-xl font-bold text-slate-900 flex items-center">
                <Database className="h-6 w-6 mr-2 text-indigo-600" /> FreeHost
             </span>
             <p className="text-sm text-slate-500 mt-2">Powered by Google Drive API.</p>
          </div>
          <div className="flex space-x-6 text-sm text-slate-600">
            <a href="#" className="hover:text-indigo-600">Documentation API</a>
            <a href="#" className="hover:text-indigo-600">Confidentialité</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
            <a href="#" className="hover:text-indigo-600">CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );
};