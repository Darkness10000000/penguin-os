export interface Window {
  id: string;
  title: string;
  appName: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon: React.ReactNode;
  content?: string;
  children?: FileItem[];
  path: string;
}

export interface App {
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

export interface TerminalCommand {
  command: string;
  output: string;
}