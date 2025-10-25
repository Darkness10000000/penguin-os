import { Window } from '@/types/system';
import { useIsMobile } from '@/hooks/use-is-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className={`fixed ${isMobile ? 'bottom-0 left-0 right-0 rounded-t-2xl px-2 py-3' : 'bottom-2 left-1/2 -translate-x-1/2 rounded-2xl px-3 py-2'} bg-dock-bg/80 backdrop-blur-xl flex items-center ${isMobile ? 'justify-around' : 'gap-2'} shadow-dock border border-window-border/20 z-[9999] safe-area-bottom`}>
      {/* App Icons */}
      {apps.map((app, index) => (
        <button
          key={index}
          onClick={app.action}
          className={`group relative ${isMobile ? 'p-2' : 'p-3'} hover:bg-dock-hover rounded-xl transition-all duration-200 dock-icon touch-manipulation`}
          title={app.name}
        >
          <div className={`text-white/90 group-hover:text-white transition-colors ${isMobile ? 'scale-90' : ''}`}>
            {app.icon}
          </div>
          {/* Active indicator */}
          {windows.some(w => w.appName === app.name && !w.isMinimized) && (
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${isMobile ? 'w-1.5 h-1.5' : 'w-1 h-1'} bg-primary rounded-full`} />
          )}
        </button>
      ))}
      
      {/* Separator */}
      {!isMobile && windows.length > 0 && (
        <div className="w-px h-10 bg-window-border/30 mx-1" />
      )}
      
      {/* Open Windows - hidden on mobile since windows are always fullscreen */}
      {!isMobile && windows.map((window) => (
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