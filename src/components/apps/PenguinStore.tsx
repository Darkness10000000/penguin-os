import { useState } from 'react';
import { Download, Check, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface StoreApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  size: string;
  rating: number;
  downloads: number;
  storageKey: string;
  eventName: string;
}

const availableApps: StoreApp[] = [
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'A simple and elegant calculator for your daily calculations',
    icon: '🧮',
    version: '1.0.0',
    size: '1.2 MB',
    rating: 4.5,
    downloads: 1520,
    storageKey: 'calculator_installed',
    eventName: 'calculator-installed'
  },
  {
    id: 'systemheart',
    name: 'System Heart',
    description: 'Your virtual AI companion - chat and interact with an intelligent assistant',
    icon: '💖',
    version: '2.1.0',
    size: '3.8 MB',
    rating: 4.8,
    downloads: 5420,
    storageKey: 'systemheart_installed',
    eventName: 'systemheart-installed'
  },
  {
    id: 'digitalhearts',
    name: 'Digital Hearts',
    description: 'An immersive visual novel experience with branching storylines',
    icon: '🎮',
    version: '1.5.2',
    size: '12.4 MB',
    rating: 4.7,
    downloads: 3890,
    storageKey: 'digitalhearts_installed',
    eventName: 'digitalhearts-installed'
  },
  {
    id: 'servermanager',
    name: 'Server Manager',
    description: 'Manage and monitor your servers with an intuitive interface',
    icon: '🖥️',
    version: '3.0.1',
    size: '5.6 MB',
    rating: 4.6,
    downloads: 2340,
    storageKey: 'servermanager_installed',
    eventName: 'servermanager-installed'
  }
];

const PenguinStore = () => {
  const { toast } = useToast();
  const [installedApps, setInstalledApps] = useState<Set<string>>(() => {
    const installed = new Set<string>();
    availableApps.forEach(app => {
      if (localStorage.getItem(app.storageKey) === 'true') {
        installed.add(app.id);
      }
    });
    return installed;
  });

  const handleInstall = (app: StoreApp) => {
    localStorage.setItem(app.storageKey, 'true');
    setInstalledApps(prev => new Set(prev).add(app.id));
    window.dispatchEvent(new Event(app.eventName));
    
    toast({
      title: "App Installed",
      description: `${app.name} has been successfully installed`,
    });
  };

  const handleUninstall = (app: StoreApp) => {
    localStorage.removeItem(app.storageKey);
    setInstalledApps(prev => {
      const newSet = new Set(prev);
      newSet.delete(app.id);
      return newSet;
    });
    window.dispatchEvent(new Event(app.eventName.replace('-installed', '-removed')));
    
    toast({
      title: "App Uninstalled",
      description: `${app.name} has been removed`,
      variant: "destructive",
    });
  };

  return (
    <div className="h-full w-full overflow-auto bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Penguin Store</h1>
        <p className="text-muted-foreground">Discover and install apps for your PenguinOS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableApps.map((app) => {
          const isInstalled = installedApps.has(app.id);
          
          return (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{app.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{app.rating}</span>
                        </div>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{app.downloads.toLocaleString()} downloads</span>
                      </CardDescription>
                    </div>
                  </div>
                  {isInstalled && (
                    <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                      <Check className="w-3 h-3" />
                      Installed
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Version {app.version}</span>
                  <span>{app.size}</span>
                </div>
                {isInstalled ? (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => handleUninstall(app)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Uninstall
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => handleInstall(app)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PenguinStore;
