import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Play, File as FileIcon, Trash, Plus, ChevronLeft, Layout, Type, FileCode, Monitor, Smartphone, Tablet, Eye, Code as CodeIcon, History, Folder, Image as ImageIcon, Globe, Loader, RefreshCw, ExternalLink } from 'lucide-react';
import { Site, FileObject } from '../types';
import { fileService, siteService } from '../services/mockBackend';

interface EditorProps {
  siteId: string;
  onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ siteId, onBack }) => {
  const [site, setSite] = useState<Site | undefined>(undefined);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [visualMode, setVisualMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{url: string, message: string} | null>(null);
  
  const visualEditorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = siteService.getSite(siteId);
    setSite(s);
    if (s) {
      const fs = fileService.getFiles(siteId);
      setFiles(fs);
      if (fs.length > 0) {
        setActiveFileId(fs[0].id);
        setCode(fs[0].content);
      }
    }
  }, [siteId]);

  const handleSave = useCallback(() => {
    if (!activeFileId) return;
    
    let contentToSave = code;
    if (visualMode && visualEditorRef.current) {
        // Super basic WYSIWYG extraction
        contentToSave = visualEditorRef.current.innerHTML;
        setCode(contentToSave);
    }

    const file = files.find(f => f.id === activeFileId);
    if (file) {
      const updatedFile = { ...file, content: contentToSave };
      fileService.saveFile(updatedFile);
      const newFiles = files.map(f => f.id === activeFileId ? updatedFile : f);
      setFiles(newFiles);
      
      // Create a version entry randomly for demo
      if(Math.random() > 0.7) {
          fileService.createVersion(siteId, `Auto-save ${new Date().toLocaleTimeString()}`);
      }
    }
  }, [activeFileId, code, files, visualMode, siteId]);

  const handleFileClick = (fileId: string) => {
    handleSave(); 
    const file = files.find(f => f.id === fileId);
    if (file) {
      setActiveFileId(fileId);
      setCode(file.content);
      // Only allow visual mode for HTML
      if (file.type !== 'html') setVisualMode(false);
    }
  };

  const handleCreateFile = () => {
    const fileName = prompt("Nom du fichier (ex: style.css, about.html)");
    if (fileName && site) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      let type: FileObject['type'] = 'html';
      if (ext === 'css') type = 'css';
      if (ext === 'js') type = 'js';
      if (['jpg', 'png', 'svg'].includes(ext || '')) type = 'image';
      
      const newFile = fileService.createFile(site.id, fileName, type);
      setFiles([...files, newFile]);
      setActiveFileId(newFile.id);
      setCode(newFile.content);
    }
  };

  const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (confirm("Supprimer ce fichier ?")) {
      fileService.deleteFile(fileId);
      const newFiles = files.filter(f => f.id !== fileId);
      setFiles(newFiles);
      if (activeFileId === fileId && newFiles.length > 0) {
        setActiveFileId(newFiles[0].id);
        setCode(newFiles[0].content);
      } else if (newFiles.length === 0) {
        setActiveFileId(null);
        setCode('');
      }
    }
  };

  const updatePreview = () => {
    handleSave();
    if (!files.length) return;

    const htmlFile = files.find(f => f.name === 'index.html') || files.find(f => f.type === 'html');
    if (!htmlFile) {
        setBlobUrl('');
        return;
    }

    let fullHtml = htmlFile.content;
    const cssFiles = files.filter(f => f.type === 'css');
    let styleBlock = '<style>';
    cssFiles.forEach(f => { styleBlock += `\n/* ${f.name} */\n${f.content}\n`; });
    styleBlock += '</style>';
    
    const jsFiles = files.filter(f => f.type === 'js');
    let scriptBlock = '<script>';
    jsFiles.forEach(f => { scriptBlock += `\n/* ${f.name} */\n${f.content}\n`; });
    scriptBlock += '</script>';

    if (fullHtml.includes('</head>')) {
        fullHtml = fullHtml.replace('</head>', `${styleBlock}</head>`);
    } else {
        fullHtml += styleBlock;
    }

    if (fullHtml.includes('</body>')) {
        fullHtml = fullHtml.replace('</body>', `${scriptBlock}</body>`);
    } else {
        fullHtml += scriptBlock;
    }

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    setPreviewKey(prev => prev + 1);
  };

  const handlePublish = async () => {
      // 1. Ensure we are saved
      handleSave(); 
      setIsPublishing(true);
      setPublishResult(null);
      
      try {
          // 2. Call Backend
          const result = await siteService.publishSite(siteId);
          
          if (result.success) {
              const message = result.provider === 'google_drive'
                  ? "Site synchronisé avec succès sur Google Drive !"
                  : "Site déployé sur le serveur cloud !";
              
              setPublishResult({ url: result.url, message });
              
              // 3. Open link automatically after a short delay
              // Using window.open in an async callback might be blocked by pop-up blockers, 
              // but we provide a manual link in the UI just in case.
              setTimeout(() => {
                  const newWindow = window.open(result.url, '_blank');
                  if (!newWindow) {
                      // Fallback if blocked
                      alert(`Site publié ! Veuillez autoriser les pop-ups ou cliquez sur le lien affiché.`);
                  }
              }, 500);
          } else {
              alert("Erreur lors de la publication.");
          }
          
      } catch (error) {
          console.error("Publication error", error);
          alert("Une erreur technique est survenue.");
      } finally {
          setIsPublishing(false);
      }
  };

  useEffect(() => {
    if (files.length > 0) { updatePreview(); }
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [files.length]);

  if (!site) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans relative">
      
      {/* Success Notification Overlay */}
      {publishResult && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl border border-green-200 p-4 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-full mx-4">
              <div className="flex items-start">
                  <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Globe className="h-6 w-6 text-green-600" />
                      </div>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-green-900">
                          Publication réussie !
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                          {publishResult.message}
                      </p>
                      <div className="mt-3 flex space-x-3">
                          <a 
                            href={publishResult.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                          >
                             Ouvrir le site <ExternalLink className="ml-1.5 h-3 w-3"/>
                          </a>
                          <button
                            onClick={() => setPublishResult(null)}
                            className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md text-xs font-medium"
                          >
                              Fermer
                          </button>
                      </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                      <button
                          className="bg-white rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
                          onClick={() => setPublishResult(null)}
                      >
                          <span className="sr-only">Close</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800 flex items-center">
                {site.name}
                <span className={`ml-2 px-2 py-0.5 rounded text-[10px] border border-slate-200 ${site.storageProvider === 'google_drive' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    {site.storageProvider === 'google_drive' ? 'Drive' : 'Local'}
                </span>
            </h1>
            <div className="text-xs text-green-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> 
              https://{site.subdomain}.freehost.app
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
            <div className="hidden md:flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Smartphone className="h-4 w-4" /></button>
                <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Tablet className="h-4 w-4" /></button>
                <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Monitor className="h-4 w-4" /></button>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <button 
                onClick={handleSave} 
                className="flex items-center text-slate-600 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
                title="Sauvegarder (Ctrl+S)"
            >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sauvegarder</span>
            </button>
            
            <button 
                onClick={updatePreview}
                className="flex items-center bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-200 font-medium transition-colors"
                title="Rafraîchir l'aperçu local"
            >
                <Play className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Aperçu</span>
            </button>

            <button 
                id="publishBtn"
                onClick={handlePublish}
                disabled={isPublishing}
                className={`flex items-center px-4 py-1.5 rounded-md font-medium shadow-sm transition-all ${
                    isPublishing 
                    ? 'bg-indigo-400 cursor-wait text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
                {isPublishing ? (
                    <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        <span>Envoi...</span>
                    </>
                ) : (
                    <>
                        <Globe className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Publier</span>
                    </>
                )}
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-100">
            <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Fichiers</span>
            <div className="flex space-x-1">
                 <button onClick={() => setShowHistory(!showHistory)} className={`p-1.5 rounded hover:bg-slate-200 ${showHistory ? 'text-indigo-600 bg-slate-200' : 'text-slate-500'}`} title="Historique">
                    <History className="h-4 w-4" />
                 </button>
                 <button onClick={handleCreateFile} className="p-1.5 hover:bg-slate-200 rounded text-slate-500" title="Nouveau fichier">
                    <Plus className="h-4 w-4" />
                 </button>
            </div>
          </div>
          
          {showHistory ? (
              <div className="flex-1 overflow-y-auto p-2">
                  <div className="text-xs font-semibold text-slate-500 mb-2 px-2">Historique des versions</div>
                  {fileService.getVersions(siteId).map(v => (
                      <div key={v.id} className="px-3 py-2 text-sm border-l-2 border-slate-300 hover:bg-slate-100 cursor-pointer ml-2">
                          <div className="font-medium text-slate-700">{v.label}</div>
                          <div className="text-xs text-slate-400">{new Date(v.timestamp).toLocaleString()}</div>
                      </div>
                  ))}
                  <button onClick={() => setShowHistory(false)} className="w-full mt-4 text-xs text-center text-indigo-600 hover:underline">
                      Retour aux fichiers
                  </button>
              </div>
          ) : (
              <div className="flex-1 overflow-y-auto">
                 {/* Fake Folder Structure */}
                 <div className="px-2 py-2">
                    <div className="flex items-center text-sm text-slate-500 mb-1 px-2">
                        <Folder className="h-4 w-4 mr-2 text-blue-400 fill-current" />
                        <span>root</span>
                    </div>
                    <div className="ml-4 border-l border-slate-200 pl-1">
                        {files.map(file => (
                          <div 
                            key={file.id}
                            onClick={() => handleFileClick(file.id)}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm mb-0.5 ${activeFileId === file.id ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600 hover:bg-slate-100'}`}
                          >
                            <div className="flex items-center truncate w-full">
                               {file.type === 'html' ? <Layout className="h-3.5 w-3.5 mr-2 text-orange-500"/> : 
                                file.type === 'css' ? <Type className="h-3.5 w-3.5 mr-2 text-blue-500"/> : 
                                file.type === 'image' ? <ImageIcon className="h-3.5 w-3.5 mr-2 text-purple-500"/> :
                                <FileCode className="h-3.5 w-3.5 mr-2 text-yellow-500"/>}
                               <span className="truncate">{file.name}</span>
                            </div>
                            <button onClick={(e) => handleDeleteFile(e, file.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-opacity">
                                <Trash className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                 </div>
              </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white relative">
           {activeFile ? (
               <>
                <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4">
                    <span className="text-xs font-mono text-slate-500">{activeFile.name}</span>
                    {activeFile.type === 'html' && (
                         <div className="flex bg-slate-200 p-0.5 rounded">
                             <button 
                                onClick={() => setVisualMode(false)}
                                className={`px-2 py-0.5 text-xs rounded flex items-center ${!visualMode ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                             >
                                 <CodeIcon className="h-3 w-3 mr-1" /> Code
                             </button>
                             <button 
                                onClick={() => setVisualMode(true)}
                                className={`px-2 py-0.5 text-xs rounded flex items-center ${visualMode ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                             >
                                 <Eye className="h-3 w-3 mr-1" /> Visuel
                             </button>
                         </div>
                    )}
                </div>
                
                {visualMode && activeFile.type === 'html' ? (
                    <div className="flex-1 bg-white overflow-auto">
                         <div 
                            ref={visualEditorRef}
                            className="w-full h-full p-8 outline-none prose max-w-none"
                            contentEditable
                            suppressContentEditableWarning
                            dangerouslySetInnerHTML={{__html: code}}
                         />
                         <div className="absolute bottom-4 right-4 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded shadow opacity-70 pointer-events-none">
                             Mode Édition Visuelle (WYSIWYG)
                         </div>
                    </div>
                ) : (
                    <textarea
                        className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-[#1e293b] text-slate-300 leading-relaxed"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                        placeholder="// Commencez à coder..."
                    />
                )}
               </>
           ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                   <FileIcon className="h-12 w-12 mb-2 opacity-20" />
                   <p>Sélectionnez un fichier pour l'éditer</p>
               </div>
           )}
        </div>

        {/* Preview Pane */}
        <div className="flex-1 bg-slate-200/50 flex items-center justify-center relative overflow-hidden p-8">
             <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-medium text-slate-500 border border-slate-200 shadow-sm">
                Aperçu Live (Iframe)
             </div>
             <div className="absolute top-4 left-4 z-10">
                 <button onClick={updatePreview} className="bg-white/90 backdrop-blur p-1.5 rounded-full shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600">
                    <RefreshCw className="h-4 w-4" />
                 </button>
             </div>
            
             <div 
                className={`transition-all duration-300 bg-white shadow-xl overflow-hidden border border-slate-300 origin-center
                    ${previewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[30px] border-[8px] border-slate-800' : 
                      previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-[20px] border-[8px] border-slate-800 scale-75' : 
                      'w-full h-full rounded-lg'}`}
             >
                {blobUrl ? (
                    <iframe 
                        key={previewKey}
                        src={blobUrl}
                        className="w-full h-full bg-white"
                        title="Site Preview"
                        sandbox="allow-same-origin allow-scripts allow-modals" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-white">
                        <Play className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">Cliquez sur "Aperçu" pour voir le résultat</p>
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};