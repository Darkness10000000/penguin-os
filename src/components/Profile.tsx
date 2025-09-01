import { useState, useEffect } from 'react';
import { User, Settings, FolderOpen, Globe, LogOut, Lock, UserCog, Power, Battery, Wifi, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileProps {
  username: string;
  onContinue?: () => void;
  onLogout: () => void;
  sessionStartTime?: Date;
}

const Profile = ({ username, onContinue, onLogout, sessionStartTime = new Date() }: ProfileProps) => {
  const [systemInfo] = useState({
    osVersion: 'PenguinOS 2.0 LTS',
    uptime: '2 hours, 34 minutes',
    battery: 85,
    network: 'Connected'
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [status] = useState<'Online' | 'Away' | 'Do Not Disturb'>('Online');

  // Calculate session duration
  const getSessionDuration = () => {
    const now = currentTime.getTime();
    const start = sessionStartTime.getTime();
    const diff = now - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const favoriteApps = [
    { name: 'Settings', icon: <Settings className="w-6 h-6" />, action: () => {} },
    { name: 'File Explorer', icon: <FolderOpen className="w-6 h-6" />, action: () => {} },
    { name: 'Web Browser', icon: <Globe className="w-6 h-6" />, action: () => {} },
  ];

  const getStatusColor = () => {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'Away': return 'bg-yellow-500';
      case 'Do Not Disturb': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden">
      {/* Blurred background */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110"
        style={{ 
          backgroundImage: 'url(/src/assets/wallpaper.jpg)',
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

      {/* Profile Panel */}
      <div className="relative bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-[480px] animate-fade-in">
        {/* Top Section - Profile */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-primary/20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                <User className="w-16 h-16 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ${getStatusColor()} border-2 border-card`} />
          </div>
          
          <h2 className="text-2xl font-semibold text-foreground mt-4">{username}</h2>
          <Badge variant="secondary" className="mt-2">{status}</Badge>
        </div>

        {/* Middle Section - System Info */}
        <div className="space-y-4 mb-8 p-4 bg-background/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Session Time
            </span>
            <span className="text-foreground font-mono">
              {getSessionDuration()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Login Time</span>
            <span className="text-foreground">
              {sessionStartTime.toLocaleString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">OS Version</span>
            <span className="text-foreground">{systemInfo.osVersion}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uptime</span>
            <span className="text-foreground">{systemInfo.uptime}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Battery
            </span>
            <span className="text-foreground">{systemInfo.battery}%</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Network
            </span>
            <span className="text-foreground">{systemInfo.network}</span>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Access</h3>
          <div className="flex justify-center gap-3">
            {favoriteApps.map((app) => (
              <button
                key={app.name}
                onClick={app.action}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="p-2 rounded-lg bg-background/50 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {app.icon}
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section - Actions */}
        <div className="space-y-3">
          <Button 
            onClick={onContinue} 
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            Continue to Desktop
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Switch User
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              className="flex-1"
              size="sm"
            >
              <Power className="w-4 h-4 mr-2" />
              Shutdown
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              size="sm"
            >
              Restart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;