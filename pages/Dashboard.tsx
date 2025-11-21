import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ExternalLink, Edit3, BarChart2, HardDrive, Cloud, RefreshCw, UploadCloud } from 'lucide-react';
import { User, Site } from '../types';
import { siteService } from '../services/mockBackend';

interface DashboardProps {
  user: User;
  onEditSite: (siteId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onEditSite }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [useDriveStorage, setUseDriveStorage] = useState(!!user.isGoogleConnected);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSites(siteService.getUserSites(user.id));
  }, [user.id]);

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;
    
    const newSite = siteService.createSite(user.id, newSiteName, useDriveStorage);
    setSites([...sites, newSite]);
    setNewSiteName('');
    setIsModalOpen(false);
  };

  const handleDeleteSite = (siteId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site définitivement ? Les fichiers sur Drive seront mis à la corbeille.')) {
      siteService.deleteSite(siteId);
      setSites(sites.filter(s => s.id !== siteId));
    }
  };

  const toggleStorage = (site: Site) => {
      const newProvider = site.storageProvider === 'local' ? 'google_drive' : 'local';
      if (newProvider === 'google_drive' && !user.isGoogleConnected) {
          alert("Veuillez connecter votre compte Google dans les paramètres pour activer le stockage Drive.");
          return;
      }
      siteService.updateSiteStorage(site.id, newProvider);
      setSites(sites.map(s => s.id === site.id ? { ...s, storageProvider: newProvider } : s));
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      // In a real app, we would process files here.
      // For mock, we just open the create modal
      if (e.dataTransfer.files.length > 0) {
          setIsModalOpen(true);
          setNewSiteName(e.dataTransfer.files[0].name.split('.')[0]);
      }
  };

  return (
    <div 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] transition-colors ${isDragging ? 'bg-indigo-50 border-2 border-dashed border-indigo-400 rounded-xl' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-50/90 z-50 rounded-xl">
              <div className="text-center">
                  <UploadCloud className="h-20 w-20 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-indigo-900">Déposez vos fichiers pour créer un site</h2>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
           <div className="flex items-center mt-1">
                <span className={`flex items-center text-sm ${user.isGoogleConnected ? 'text-green-600' : 'text-slate-500'}`}>
                    {user.isGoogleConnected ? 
                        <><Cloud className="w-4 h-4 mr-1" /> Compte Google connecté (Drive actif)</> : 
                        <><HardDrive className="w-4 h-4 mr-1" /> Stockage Local (Non synchronisé)</>
                    }
                </span>
           </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Site
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Cloud className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase">Espace Drive Utilisé</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{(sites.reduce((acc, s) => acc + s.size, 0) / 1024).toFixed(2)} KB</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <BarChart2 className="h-6 w-6" />
            </div>
             <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase">Visites (30j)</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">24.5k</p>
            </div>
         </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                <RefreshCw className="h-6 w-6" />
            </div>
             <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase">Dernière Sync</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">Il y a 2m</p>
            </div>
         </div>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-slate-300">
          <UploadCloud className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Aucun site hébergé</h3>
          <p className="mt-2 text-slate-500 max-w-sm mx-auto">Glissez un dossier ici ou créez un nouveau site manuellement pour commencer l'hébergement sur Drive.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Créer un projet vide
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                     <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${site.storageProvider === 'google_drive' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
                        {site.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 truncate max-w-[120px]">{site.name}</h3>
                        <div className="flex items-center text-xs text-slate-500">
                            {site.storageProvider === 'google_drive' ? <Cloud className="h-3 w-3 mr-1 text-blue-500" /> : <HardDrive className="h-3 w-3 mr-1 text-slate-500" />}
                            {site.storageProvider === 'google_drive' ? 'Google Drive' : 'Local'}
                        </div>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {site.status === 'active' ? '● En ligne' : '○ Maintenance'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center bg-slate-100 px-1 rounded border border-slate-200">
                         SSL <ShieldIcon className="w-2 h-2 ml-1 text-green-500"/>
                      </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded p-2 mb-4 text-xs font-mono text-slate-600 truncate flex items-center justify-between group cursor-pointer hover:bg-slate-100 border border-slate-100">
                    <span>{site.subdomain}.freehost.app</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="text-xs text-slate-500 mb-4 space-y-1">
                    <div className="flex justify-between">
                        <span>Utilisation:</span>
                        <span className="font-medium">{(site.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                         <span>Provider:</span>
                         <button onClick={() => toggleStorage(site)} className="text-indigo-600 hover:underline">
                             Changer ({site.storageProvider === 'google_drive' ? 'Drive' : 'Local'})
                         </button>
                    </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex space-x-3">
                   <button 
                    onClick={() => onEditSite(site.id)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                   >
                     <Edit3 className="h-4 w-4 mr-2" />
                     Gérer
                   </button>
                   <button 
                     onClick={() => handleDeleteSite(site.id)}
                     className="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Site */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                        <Plus className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-slate-900">Nouveau Site</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du projet</label>
                                <input
                                    type="text"
                                    required
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md p-2 border"
                                    placeholder="mon-portfolio-2024"
                                    value={newSiteName}
                                    onChange={(e) => setNewSiteName(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu de stockage</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setUseDriveStorage(false)}
                                        className={`flex flex-col items-center p-3 border rounded-lg text-sm ${!useDriveStorage ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <HardDrive className="h-5 w-5 mb-1" />
                                        Stockage Local
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!user.isGoogleConnected}
                                        onClick={() => setUseDriveStorage(true)}
                                        className={`flex flex-col items-center p-3 border rounded-lg text-sm relative ${useDriveStorage ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'} ${!user.isGoogleConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Cloud className="h-5 w-5 mb-1" />
                                        Google Drive
                                        {!user.isGoogleConnected && <span className="text-[10px] text-red-500 absolute bottom-1">Non connecté</span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={handleCreateSite} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                  Créer le site
                </button>
                <button onClick={() => setIsModalOpen(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);