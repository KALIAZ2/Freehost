export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isGoogleConnected?: boolean;
}

export interface FileObject {
  id: string;
  siteId: string;
  name: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'json' | 'image';
  lastModified: string;
}

export interface SiteVersion {
  id: string;
  timestamp: string;
  label: string;
}

export interface Site {
  id: string;
  userId: string;
  name: string;
  subdomain: string;
  createdAt: string;
  visits: number;
  status: 'active' | 'maintenance';
  storageProvider: 'local' | 'google_drive';
  size: number; // in bytes
}

export type View = 'home' | 'login' | 'register' | 'dashboard' | 'editor';

export interface RouteState {
  view: View;
  siteId?: string;
}