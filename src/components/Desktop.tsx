import { useEffect, useState } from 'react';
import wallpaper from '@/assets/wallpaper.jpg';
import TopPanel from './TopPanel';
import Dock from './Dock';
import WindowManager from './WindowManager';
import Login from './Login';
import Profile from './Profile';
import ServerTerminal from './ServerTerminal';
import { Window } from '@/types/system';
import Terminal from './apps/Terminal';
import FileExplorer from './apps/FileExplorer';
import WebBrowser from './apps/WebBrowser';
import Settings from './apps/Settings';
import SystemHeart from './apps/SystemHeart';
import TextEditor from './apps/TextEditor';
import VisualNovel from './apps/VisualNovel';
import ServerManager from './apps/ServerManager';
import PenguinStore from './apps/PenguinStore';
import Calculator from './apps/Calculator';
import AppBuilder from './apps/AppBuilder';
import { Terminal as TerminalIcon, FolderOpen, Globe, User, Settings as SettingsIcon, HelpCircle, Heart, FileText, Gamepad2, Server, Store, Calculator as CalculatorIcon, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Desktop = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [systemHeartInstalled, setSystemHeartInstalled] = useState(
    localStorage.getItem('systemheart_installed') === 'true'
  );
  const [digitalHeartsInstalled, setDigitalHeartsInstalled] = useState(
    localStorage.getItem('digitalhearts_installed') === 'true'
  );
  const [serverManagerInstalled, setServerManagerInstalled] = useState(
    localStorage.getItem('servermanager_installed') === 'true'
  );
  const [calculatorInstalled, setCalculatorInstalled] = useState(
    localStorage.getItem('calculator_installed') === 'true'
  );
  const [authState, setAuthState] = useState<'login' | 'profile' | 'desktop'>('login');
  const [currentUser, setCurrentUser] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [showProfileFromDesktop, setShowProfileFromDesktop] = useState(false);
  const [serverMode, setServerMode] = useState(false);
  const [serverStartTime, setServerStartTime] = useState<Date>(new Date());
  const [isGuest, setIsGuest] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    const savedSessionTime = localStorage.getItem('session_start_time');
    const savedGuestMode = localStorage.getItem('is_guest');
    
    if (savedUser) {
      setCurrentUser(savedUser);
      setAuthState('desktop');
      setIsGuest(savedGuestMode === 'true');
      if (savedSessionTime) {
        setSessionStartTime(new Date(savedSessionTime));
      }
    }
  }, []);

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
  
  const handleLogin = (email: string) => {
    const now = new Date();
    setCurrentUser(email);
    setSessionStartTime(now);
    setIsGuest(false);
    localStorage.setItem('current_user', email);
    localStorage.setItem('session_start_time', now.toISOString());
    localStorage.setItem('is_guest', 'false');
    setAuthState('profile');
  };
  
  const handleGuestLogin = () => {
    const now = new Date();
    setCurrentUser('Guest');
    setSessionStartTime(now);
    setIsGuest(true);
    localStorage.setItem('current_user', 'Guest');
    localStorage.setItem('session_start_time', now.toISOString());
    localStorage.setItem('is_guest', 'true');
    setAuthState('profile');
  };
  
  const handleContinueToDesktop = () => {
    setAuthState('desktop');
    setShowProfileFromDesktop(false);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('current_user');
    localStorage.removeItem('session_start_time');
    localStorage.removeItem('is_guest');
    setCurrentUser('');
    setIsGuest(false);
    setAuthState('login');
    setWindows([]);
    setShowProfileFromDesktop(false);
  };
  
  const handleProfileClick = () => {
    setShowProfileFromDesktop(true);
  };
  
  const handleEnterServerMode = () => {
    setServerMode(true);
    setServerStartTime(new Date());
  };
  
  const handleExitServerMode = () => {
    setServerMode(false);
  };
  
  const handleOpenAppFromServer = (appName: string) => {
    const appMap: { [key: string]: () => void } = {
      'terminal': () => createWindow('Terminal', 'Terminal', <TerminalIcon className="w-4 h-4" />, <Terminal />),
      'files': () => createWindow('Files', 'File Explorer', <FolderOpen className="w-4 h-4" />, <FileExplorer onOpenFile={openFileInEditor} />),
      'firefox': () => createWindow('Firefox', 'Web Browser', <Globe className="w-4 h-4" />, <WebBrowser />),
      'settings': () => createWindow('Settings', 'System Settings', <SettingsIcon className="w-4 h-4" />, <Settings onEnterServerMode={handleEnterServerMode} />),
      'about': () => {
        const handleDownload = () => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
              .then(() => {
                if ((window as any).deferredPrompt) {
                  (window as any).deferredPrompt.prompt();
                }
              });
          }
        };
        
        createWindow('About', 'About System', <HelpCircle className="w-4 h-4" />, 
          <div className="p-6 text-foreground">
            <h2 className="text-2xl font-bold mb-4">PenguinOS</h2>
            <p className="text-muted-foreground mb-2">Version 1.0.0</p>
            <p className="text-muted-foreground mb-6">A Linux-like operating system built with React</p>
            
            <div className="mt-8 p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Download Application</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Install PenguinOS as a standalone app on your device for offline access and better performance.
              </p>
              <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download App
              </button>
            </div>
            
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kernel:</span>
                <span className="font-mono">5.15.0-penguin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desktop Environment:</span>
                <span className="font-mono">PenguinDE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Architecture:</span>
                <span className="font-mono">x86_64</span>
              </div>
            </div>
          </div>
        )
      },
      'penguin store': () => createWindow('Penguin Store', 'Penguin Store', <Store className="w-4 h-4" />, <PenguinStore onOpenAppBuilder={() => handleOpenAppFromServer('app builder')} />),
      'app builder': () => createWindow('App Builder', 'App Builder', <Code className="w-4 h-4" />, <AppBuilder />),
      'calculator': () => calculatorInstalled && createWindow('Calculator', 'Calculator', <CalculatorIcon className="w-4 h-4" />, <Calculator />),
      'server manager': () => serverManagerInstalled && createWindow('Server Manager', 'Server Manager', <Server className="w-4 h-4" />, <ServerManager currentUser={currentUser} onEnterServerMode={handleEnterServerMode} />),
      'system heart': () => systemHeartInstalled && createWindow('System Heart', 'System Heart - Virtual Companion', <Heart className="w-4 h-4 text-pink-500" />, <SystemHeart />),
      'digital hearts': () => digitalHeartsInstalled && createWindow('Digital Hearts', 'Digital Hearts - Visual Novel', <Gamepad2 className="w-4 h-4 text-purple-500" />, <VisualNovel />)
    };
    
    const normalizedAppName = appName.toLowerCase();
    if (appMap[normalizedAppName]) {
      appMap[normalizedAppName]();
    }
  };
  
  // Function to open text editor with file content
  const openFileInEditor = (fileName: string, content: string) => {
    createWindow(
      'TextEditor',
      `Text Editor - ${fileName}`,
      <FileText className="w-4 h-4" />,
      <TextEditor initialContent={content} fileName={fileName} />
    );
  };

  const openAppBuilder = () => {
    createWindow('App Builder', 'App Builder', <Code className="w-4 h-4" />, <AppBuilder />);
  };

  const apps = [
    {
      name: 'Penguin Store',
      icon: <Store className="w-8 h-8" />,
      action: () => createWindow('Penguin Store', 'Penguin Store', <Store className="w-4 h-4" />, <PenguinStore onOpenAppBuilder={openAppBuilder} />)
    },
    ...(!isGuest ? [{
      name: 'App Builder',
      icon: <Code className="w-8 h-8" />,
      action: openAppBuilder
    }] : []),
    ...(systemHeartInstalled ? [{
      name: 'System Heart',
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      action: () => createWindow('System Heart', 'System Heart - Virtual Companion', <Heart className="w-4 h-4 text-pink-500" />, <SystemHeart />)
    }] : []),
    ...(digitalHeartsInstalled ? [{
      name: 'Digital Hearts',
      icon: <Gamepad2 className="w-8 h-8 text-purple-500" />,
      action: () => createWindow('Digital Hearts', 'Digital Hearts - Visual Novel', <Gamepad2 className="w-4 h-4 text-purple-500" />, <VisualNovel />)
    }] : []),
    ...(calculatorInstalled ? [{
      name: 'Calculator',
      icon: <CalculatorIcon className="w-8 h-8" />,
      action: () => createWindow('Calculator', 'Calculator', <CalculatorIcon className="w-4 h-4" />, <Calculator />)
    }] : []),
    ...(!isGuest ? [{
      name: 'Terminal',
      icon: <TerminalIcon className="w-8 h-8" />,
      action: () => createWindow('Terminal', 'Terminal', <TerminalIcon className="w-4 h-4" />, <Terminal />)
    }] : []),
    {
      name: 'Files',
      icon: <FolderOpen className="w-8 h-8" />,
      action: () => createWindow('Files', 'File Explorer', <FolderOpen className="w-4 h-4" />, <FileExplorer onOpenFile={openFileInEditor} />)
    },
    {
      name: 'Firefox',
      icon: <Globe className="w-8 h-8" />,
      action: () => createWindow('Firefox', 'Web Browser', <Globe className="w-4 h-4" />, <WebBrowser />)
    },
    {
      name: 'Settings',
      icon: <SettingsIcon className="w-8 h-8" />,
      action: () => createWindow('Settings', 'System Settings', <SettingsIcon className="w-4 h-4" />, <Settings onEnterServerMode={isGuest ? undefined : handleEnterServerMode} />)
    },
    ...(!isGuest && serverManagerInstalled ? [{
      name: 'Server Manager',
      icon: <Server className="w-8 h-8" />,
      action: () => createWindow('Server Manager', 'Server Manager', <Server className="w-4 h-4" />, <ServerManager currentUser={currentUser} onEnterServerMode={handleEnterServerMode} />)
    }] : []),
    {
      name: 'About',
      icon: <HelpCircle className="w-8 h-8" />,
      action: () => {
        const handleDownload = () => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
              .then(() => {
                if ((window as any).deferredPrompt) {
                  (window as any).deferredPrompt.prompt();
                }
              });
          }
        };
        
        createWindow('About', 'About System', <HelpCircle className="w-4 h-4" />, 
          <div className="p-6 text-foreground">
            <h2 className="text-2xl font-bold mb-4">PenguinOS</h2>
            <p className="text-muted-foreground mb-2">Version 1.0.0</p>
            <p className="text-muted-foreground mb-6">A Linux-like operating system built with React</p>
            
            <div className="mt-8 p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Download Application</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Install PenguinOS as a standalone app on your device for offline access and better performance.
              </p>
              <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download App
              </button>
            </div>
            
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kernel:</span>
                <span className="font-mono">5.15.0-penguin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desktop Environment:</span>
                <span className="font-mono">PenguinDE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Architecture:</span>
                <span className="font-mono">x86_64</span>
              </div>
            </div>
          </div>
        )
      }
    }
  ];

  useEffect(() => {
    const handleSystemHeartInstalled = () => {
      setSystemHeartInstalled(true);
    };
    
    const handleDigitalHeartsInstalled = () => {
      setDigitalHeartsInstalled(true);
    };
    
    const handleSystemHeartRemoved = () => {
      setSystemHeartInstalled(false);
      // Close any open System Heart windows
      setWindows(prev => prev.filter(w => w.appName !== 'System Heart'));
    };
    
    const handleDigitalHeartsRemoved = () => {
      setDigitalHeartsInstalled(false);
      // Close any open Digital Hearts windows
      setWindows(prev => prev.filter(w => w.appName !== 'Digital Hearts'));
    };
    
    const handleServerManagerInstalled = () => {
      setServerManagerInstalled(true);
    };
    
    const handleServerManagerRemoved = () => {
      setServerManagerInstalled(false);
      // Close any open Server Manager windows
      setWindows(prev => prev.filter(w => w.appName !== 'Server Manager'));
    };

    const handleCalculatorInstalled = () => {
      setCalculatorInstalled(true);
    };
    
    const handleCalculatorRemoved = () => {
      setCalculatorInstalled(false);
      // Close any open Calculator windows
      setWindows(prev => prev.filter(w => w.appName !== 'Calculator'));
    };

    window.addEventListener('systemheart-installed', handleSystemHeartInstalled);
    window.addEventListener('digitalhearts-installed', handleDigitalHeartsInstalled);
    window.addEventListener('systemheart-removed', handleSystemHeartRemoved);
    window.addEventListener('digitalhearts-removed', handleDigitalHeartsRemoved);
    window.addEventListener('servermanager-installed', handleServerManagerInstalled);
    window.addEventListener('servermanager-removed', handleServerManagerRemoved);
    window.addEventListener('calculator-installed', handleCalculatorInstalled);
    window.addEventListener('calculator-removed', handleCalculatorRemoved);
    
    return () => {
      window.removeEventListener('systemheart-installed', handleSystemHeartInstalled);
      window.removeEventListener('digitalhearts-installed', handleDigitalHeartsInstalled);
      window.removeEventListener('systemheart-removed', handleSystemHeartRemoved);
      window.removeEventListener('digitalhearts-removed', handleDigitalHeartsRemoved);
      window.removeEventListener('servermanager-installed', handleServerManagerInstalled);
      window.removeEventListener('servermanager-removed', handleServerManagerRemoved);
      window.removeEventListener('calculator-installed', handleCalculatorInstalled);
      window.removeEventListener('calculator-removed', handleCalculatorRemoved);
    };
  }, []);

  // Render login screen if not authenticated
  if (authState === 'login') {
    return <Login onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }
  
  // Render profile screen after login
  if (authState === 'profile') {
    return (
      <Profile 
        username={currentUser}
        onContinue={handleContinueToDesktop}
        onLogout={handleLogout}
        sessionStartTime={sessionStartTime}
      />
    );
  }
  
  // Render desktop after profile
  return (
    <>
      <div className="h-screen w-screen overflow-hidden relative bg-desktop-bg">
        {/* Wallpaper */}
        <div 
          className="desktop-background absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
        
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        
        {/* Top Panel */}
        <TopPanel 
          onProfileClick={handleProfileClick} 
          currentUser={currentUser}
        />
        
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
      
      {/* Profile Overlay */}
      {showProfileFromDesktop && (
        <div className="fixed inset-0 z-[20000]">
          <Profile 
            username={currentUser}
            onContinue={handleContinueToDesktop}
            onLogout={handleLogout}
            sessionStartTime={sessionStartTime}
          />
        </div>
      )}
      
      {/* Server Mode Terminal */}
      {serverMode && (
        <div 
          className="fixed inset-0 z-[30000]"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleExitServerMode();
            }
          }}
          tabIndex={0}
          autoFocus
        >
          <ServerTerminal 
            onOpenApp={handleOpenAppFromServer}
            currentUser={currentUser}
            serverStartTime={serverStartTime}
          />
        </div>
      )}
    </>
  );
};

export default Desktop;