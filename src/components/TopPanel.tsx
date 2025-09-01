import { useEffect, useState } from 'react';
import { Wifi, Volume2, Battery, ChevronDown, User } from 'lucide-react';

interface TopPanelProps {
  onProfileClick?: () => void;
  currentUser?: string;
}

const TopPanel = ({ onProfileClick, currentUser = 'user' }: TopPanelProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-8 bg-panel-bg/90 panel-blur backdrop-blur-md border-b border-window-border/30 flex items-center justify-between px-4 text-panel-fg text-sm z-[10000]">
      {/* Left section - Activities */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-white/10 px-3 py-1 rounded transition-colors">
          Activities
        </button>
      </div>

      {/* Center section - Date & Time */}
      <div className="flex items-center gap-2 font-medium">
        <span>{formatDate(currentTime)}</span>
        <span className="text-primary">{formatTime(currentTime)}</span>
      </div>

      {/* Right section - System tray */}
      <div className="flex items-center gap-3">
        <Wifi className="w-4 h-4" />
        <Volume2 className="w-4 h-4" />
        <Battery className="w-4 h-4" />
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors"
          title={`Profile: ${currentUser}`}
        >
          <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default TopPanel;