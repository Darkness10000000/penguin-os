import { useEffect, useState } from 'react';
import wallpaper from '@/assets/wallpaper.jpg';
import TopPanel from './TopPanel';
import Dock from './Dock';
import WindowManager from './WindowManager';
import { Window } from '@/types/system';
import Terminal from './apps/Terminal';
import FileExplorer from './apps/FileExplorer';
import WebBrowser from './apps/WebBrowser';
import Settings from './apps/Settings';
import { Terminal as TerminalIcon, FolderOpen, Globe, User, Settings as SettingsIcon, HelpCircle } from 'lucide-react';

const Desktop = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const createWindow = (appName: string, title: string, icon: React.ReactNode, content: React.ReactNode) => {
    const newWindow: Window = {
      id: `window-${Date.now()}`,
      title,
      appName,
      icon,
      content,
      position: { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex
    };
    
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextZIndex(nextZIndex + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  };

  const maximizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
    ));
    setNextZIndex(nextZIndex + 1);
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  };

  const apps = [
    {
      name: 'Terminal',
      icon: <TerminalIcon className="w-8 h-8" />,
      action: () => createWindow('Terminal', 'Terminal', <TerminalIcon className="w-4 h-4" />, <Terminal />)
    },
    {
      name: 'Files',
      icon: <FolderOpen className="w-8 h-8" />,
      action: () => createWindow('Files', 'File Explorer', <FolderOpen className="w-4 h-4" />, <FileExplorer />)
    },
    {
      name: 'Firefox',
      icon: <Globe className="w-8 h-8" />,
      action: () => createWindow('Firefox', 'Web Browser', <Globe className="w-4 h-4" />, <WebBrowser />)
    },
    {
      name: 'Settings',
      icon: <SettingsIcon className="w-8 h-8" />,
      action: () => createWindow('Settings', 'System Settings', <SettingsIcon className="w-4 h-4" />, <Settings />)
    },
    {
      name: 'About',
      icon: <HelpCircle className="w-8 h-8" />,
      action: () => createWindow('About', 'About System', <HelpCircle className="w-4 h-4" />, 
        <div className="p-6 text-foreground">
          <h2 className="text-2xl font-bold mb-4">PenguinOS</h2>
          <p className="text-muted-foreground mb-2">Version 1.0.0</p>
          <p className="text-muted-foreground">A Linux-like operating system built with React</p>
        </div>
      )
    }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-desktop-bg">
      {/* Wallpaper */}
      <div 
        className="desktop-background absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
      
      {/* Top Panel */}
      <TopPanel />
      
      {/* Desktop Area */}
      <div className="absolute inset-0 top-8 bottom-20">
        <WindowManager
          windows={windows}
          activeWindowId={activeWindowId}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onFocus={focusWindow}
          onUpdatePosition={updateWindowPosition}
        />
      </div>
      
      {/* Dock */}
      <Dock 
        apps={apps}
        windows={windows}
        onWindowFocus={focusWindow}
      />
    </div>
  );
};

export default Desktop;