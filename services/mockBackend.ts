import { User, Site, FileObject, SiteVersion } from '../types';

const STORAGE_KEYS = {
  USERS: 'freehost_users',
  SITES: 'freehost_sites',
  FILES: 'freehost_files',
  CURRENT_USER: 'freehost_current_user',
  VERSIONS: 'freehost_versions'
};

// Utilities
const generateId = () => Math.random().toString(36).substr(2, 9);
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};
const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Auth Services
export const authService = {
  login: (email: string): User | null => {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === email);
    if (user) {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
      return user;
    }
    return null;
  },
  googleLogin: (): Promise<User> => {
    // Simulate Google OAuth delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockGoogleUser: User = {
            id: 'google_' + generateId(),
            name: 'Utilisateur Google',
            email: 'demo@gmail.com',
            isGoogleConnected: true,
            avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
        };
        
        const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        if (!users.find(u => u.email === mockGoogleUser.email)) {
            users.push(mockGoogleUser);
            saveToStorage(STORAGE_KEYS.USERS, users);
        }
        saveToStorage(STORAGE_KEYS.CURRENT_USER, mockGoogleUser);
        resolve(mockGoogleUser);
      }, 1500);
    });
  },
  register: (name: string, email: string): User => {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const newUser: User = { id: generateId(), name, email, isGoogleConnected: false };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  getCurrentUser: (): User | null => {
    return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  toggleGoogleConnection: (userId: string, connect: boolean) => {
      const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
      const updatedUsers = users.map(u => u.id === userId ? { ...u, isGoogleConnected: connect } : u);
      saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
      
      const currentUser = getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && currentUser.id === userId) {
          saveToStorage(STORAGE_KEYS.CURRENT_USER, { ...currentUser, isGoogleConnected: connect });
      }
  }
};

// Site Services
export const siteService = {
  getUserSites: (userId: string): Site[] => {
    const sites = getFromStorage<Site[]>(STORAGE_KEYS.SITES, []);
    return sites.filter(s => s.userId === userId);
  },
  createSite: (userId: string, name: string, useDrive: boolean): Site => {
    const sites = getFromStorage<Site[]>(STORAGE_KEYS.SITES, []);
    const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + generateId().substring(0,4);
    
    const newSite: Site = {
      id: generateId(),
      userId,
      name,
      subdomain,
      createdAt: new Date().toISOString(),
      visits: 0,
      status: 'active',
      storageProvider: useDrive ? 'google_drive' : 'local',
      size: 1024 // ~1KB initial
    };
    
    sites.push(newSite);
    saveToStorage(STORAGE_KEYS.SITES, sites);
    
    // Create default index.html
    const initialFile: FileObject = {
      id: generateId(),
      siteId: newSite.id,
      name: 'index.html',
      type: 'html',
      lastModified: new Date().toISOString(),
      content: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f8fafc; color: #334155; }
        h1 { color: #2563eb; font-size: 2.5rem; margin-bottom: 1rem; }
        .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 600px; margin: 0 auto; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Bienvenue sur ${name}</h1>
        <p>Ce site est hébergé gratuitement via <strong>${useDrive ? 'Google Drive' : 'FreeHost Local'}</strong>.</p>
        <div class="badge">Site Actif 🚀</div>
    </div>
</body>
</html>`
    };
    
    const files = getFromStorage<FileObject[]>(STORAGE_KEYS.FILES, []);
    files.push(initialFile);
    saveToStorage(STORAGE_KEYS.FILES, files);

    return newSite;
  },
  deleteSite: (siteId: string) => {
    let sites = getFromStorage<Site[]>(STORAGE_KEYS.SITES, []);
    sites = sites.filter(s => s.id !== siteId);
    saveToStorage(STORAGE_KEYS.SITES, sites);
    
    // Cleanup files
    let files = getFromStorage<FileObject[]>(STORAGE_KEYS.FILES, []);
    files = files.filter(f => f.siteId !== siteId);
    saveToStorage(STORAGE_KEYS.FILES, files);
  },
  getSite: (siteId: string): Site | undefined => {
    const sites = getFromStorage<Site[]>(STORAGE_KEYS.SITES, []);
    return sites.find(s => s.id === siteId);
  },
  updateSiteStorage: (siteId: string, provider: 'local' | 'google_drive') => {
      const sites = getFromStorage<Site[]>(STORAGE_KEYS.SITES, []);
      const idx = sites.findIndex(s => s.id === siteId);
      if (idx !== -1) {
          sites[idx].storageProvider = provider;
          saveToStorage(STORAGE_KEYS.SITES, sites);
      }
  },
  /**
   * Simulate the publishing process.
   * If Google Drive: Create folder -> Upload Files -> Set Permissions -> Return Drive Link
   * If Local/Server: POST FormData -> Return Subdomain Link
   */
  publishSite: (siteId: string): Promise<{ url: string, provider: string, success: boolean }> => {
    return new Promise((resolve) => {
      const sites = getFromStorage<Site[]>(STORAGE_KEYS.SITES, []);
      const site = sites.find(s => s.id === siteId);
      const files = getFromStorage<FileObject[]>(STORAGE_KEYS.FILES, []).filter(f => f.siteId === siteId);

      if (!site) {
          resolve({ url: '', provider: 'error', success: false });
          return;
      }

      console.group(`🚀 [Publishing System] Starting deployment for: ${site.name}`);
      console.log(`📦 Files found: ${files.length}`);
      console.log(`💾 Target Storage: ${site.storageProvider}`);

      // Simulate network latency (upload time)
      const uploadTime = 1500 + (files.length * 200); 

      setTimeout(() => {
          if (site.storageProvider === 'google_drive') {
              // --- GOOGLE DRIVE API SIMULATION ---
              console.log('%c 🔵 Connecting to Google Drive API...', 'color: #4285F4');
              
              // Step 1: Create Folder
              const folderName = `${site.name}-www`;
              const folderId = `folder_${generateId()}`;
              console.log(`1️⃣ Creating Folder: "${folderName}"`);
              console.log(`   POST https://www.googleapis.com/drive/v3/files`);
              console.log(`   Body: { name: "${folderName}", mimeType: "application/vnd.google-apps.folder" }`);
              console.log(`   Response: { id: "${folderId}" }`);

              // Step 2: Upload Files
              console.log(`2️⃣ Uploading ${files.length} files...`);
              files.forEach((file, index) => {
                  let mimeType = 'text/plain';
                  if (file.name.endsWith('.html')) mimeType = 'text/html';
                  if (file.name.endsWith('.css')) mimeType = 'text/css';
                  if (file.name.endsWith('.js')) mimeType = 'application/javascript';
                  
                  console.log(`   ➡ Uploading [${index+1}/${files.length}]: ${file.name} (${mimeType})`);
                  console.log(`      POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`);
                  console.log(`      Parents: ["${folderId}"]`);
              });

              // Step 3: Set Permissions (Make Public)
              console.log(`3️⃣ Setting Permissions (Public Web Hosting)`);
              console.log(`   POST https://www.googleapis.com/drive/v3/files/${folderId}/permissions`);
              console.log(`   Body: { role: "reader", type: "anyone" }`);
              
              console.log('%c ✅ Google Drive Publish Complete!', 'color: green; font-weight: bold;');
              console.groupEnd();

              resolve({ 
                  url: `https://drive.google.com/drive/folders/${folderId}?usp=sharing`,
                  provider: 'google_drive',
                  success: true
              });

          } else {
              // --- SERVER BACKEND SIMULATION ---
              console.log('%c 🟠 Connecting to FreeHost Backend...', 'color: #f97316');
              
              // Simulate FormData construction
              console.log(`1️⃣ Preparing FormData payload...`);
              console.log(`   Files attached: ${files.map(f => f.name).join(', ')}`);

              // Simulate POST request
              console.log(`2️⃣ Sending Data`);
              console.log(`   POST /api/v1/deploy/${site.id}`);
              
              // Simulate Server processing
              console.log(`3️⃣ Server: Writing files to /var/www/${site.subdomain}`);
              console.log(`   Server: Generating SSL Certificate...`);
              
              console.log('%c ✅ Server Deployment Complete!', 'color: green; font-weight: bold;');
              console.groupEnd();
              
              resolve({ 
                  url: `https://${site.subdomain}.freehost.app`, 
                  provider: 'local',
                  success: true
              });
          }
      }, uploadTime);
    });
  }
};

// File Services
export const fileService = {
  getFiles: (siteId: string): FileObject[] => {
    const files = getFromStorage<FileObject[]>(STORAGE_KEYS.FILES, []);
    return files.filter(f => f.siteId === siteId);
  },
  saveFile: (file: FileObject) => {
    const files = getFromStorage<FileObject[]>(STORAGE_KEYS.FILES, []);
    const index = files.findIndex(f => f.id === file.id);
    const fileWithTimestamp = { ...file, lastModified: new Date().toISOString() };
    
    if (index >= 0) {
      files[index] = fileWithTimestamp;
    } else {
      files.push(fileWithTimestamp);
    }
    saveToStorage(STORAGE_KEYS.FILES, files);
    return fileWithTimestamp;
  },
  createFile: (siteId: string, name: string, type: FileObject['type'], content?: string): FileObject => {
    const files = getFromStorage<FileObject[]>(STORAGE_KEYS.FILES, []);
    const newFile: FileObject = {
      id: generateId(),
      siteId,
      name,
      type,
      lastModified: new Date().toISOString(),
      content: content || (type === 'html' ? '<h1>New Page</h1>' : type === 'css' ? 'body { background: white; }' : '// Javascript code'),
    };
    files.push(newFile);
    saveToStorage(STORAGE_KEYS.FILES, files);
    return newFile;
  },
  deleteFile: (fileId: string) => {
    let files = getFromStorage<FileObject[]>(STORAGE_KEYS.FILES, []);
    files = files.filter(f => f.id !== fileId);
    saveToStorage(STORAGE_KEYS.FILES, files);
  },
  // Simulated Versioning
  createVersion: (siteId: string, label: string) => {
      const versions = getFromStorage<SiteVersion[]>(STORAGE_KEYS.VERSIONS, []);
      versions.push({
          id: generateId(),
          timestamp: new Date().toISOString(),
          label
      });
      saveToStorage(STORAGE_KEYS.VERSIONS, versions);
  },
  getVersions: (siteId: string) => {
      // In a real app, we'd filter by siteId, but for mock we return generic mock versions
      return [
          { id: 'v1', timestamp: new Date(Date.now() - 86400000).toISOString(), label: 'Initial Commit' },
          { id: 'v2', timestamp: new Date(Date.now() - 3600000).toISOString(), label: 'Style update' },
      ];
  }
};