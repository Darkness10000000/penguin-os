import { Window } from '@/types/system';

interface DockProps {
  apps: Array<{
    name: string;
    icon: React.ReactNode;
    action: () => void;
  }>;
  windows: Window[];
  onWindowFocus: (id: string) => void;
}

const Dock = ({ apps, windows, onWindowFocus }: DockProps) => {
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-dock-bg/80 backdrop-blur-xl rounded-2xl px-3 py-2 flex items-center gap-2 shadow-dock border border-window-border/20 z-[9999]">
      {/* App Icons */}
      {apps.map((app, index) => (
        <button
          key={index}
          onClick={app.action}
          className="group relative p-3 hover:bg-dock-hover rounded-xl transition-all duration-200 dock-icon"
          title={app.name}
        >
          <div className="text-white/90 group-hover:text-white transition-colors">
            {app.icon}
          </div>
          {/* Active indicator */}
          {windows.some(w => w.appName === app.name && !w.isMinimized) && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
          )}
        </button>
      ))}
      
      {/* Separator */}
      {windows.length > 0 && (
        <div className="w-px h-10 bg-window-border/30 mx-1" />
      )}
      
      {/* Open Windows */}
      {windows.map((window) => (
        <button
          key={window.id}
          onClick={() => onWindowFocus(window.id)}
          className={`group relative p-3 hover:bg-dock-hover rounded-xl transition-all duration-200 dock-icon ${
            window.isMinimized ? 'opacity-60' : ''
          }`}
          title={window.title}
        >
          <div className="text-white/90 group-hover:text-white transition-colors">
            {window.icon}
          </div>
          {!window.isMinimized && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export default Dock;