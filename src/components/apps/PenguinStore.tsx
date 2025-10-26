import { useState, useEffect } from 'react';
import { Download, Check, Trash2, Star, Plus, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-is-mobile';

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
  const isMobile = useIsMobile();
  const [installedApps, setInstalledApps] = useState<Set<string>>(() => {
    const installed = new Set<string>();
    availableApps.forEach(app => {
      if (localStorage.getItem(app.storageKey) === 'true') {
        installed.add(app.id);
      }
    });
    return installed;
  });
  const [userApps, setUserApps] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    icon: '',
    version: '1.0.0',
    category: 'utility',
    app_code: ''
  });

  useEffect(() => {
    fetchUserApps();
  }, []);

  const fetchUserApps = async () => {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('is_approved', true);
    
    if (!error && data) {
      setUserApps(data);
    }
  };

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

  const handleCreateApp = async () => {
    if (!newApp.name || !newApp.description || !newApp.icon || !newApp.app_code) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create apps",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('apps')
      .insert({
        ...newApp,
        user_id: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create app",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "App Submitted",
      description: "Your app has been submitted for review",
    });

    setIsCreateDialogOpen(false);
    setNewApp({
      name: '',
      description: '',
      icon: '',
      version: '1.0.0',
      category: 'utility',
      app_code: ''
    });
    fetchUserApps();
  };

  return (
    <div className="h-full w-full overflow-auto bg-background p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Penguin Store</h1>
            <p className="text-muted-foreground">Discover and install apps for your PenguinOS</p>
          </div>
          {!isMobile && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create App
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New App</DialogTitle>
                  <DialogDescription>
                    Submit your app to Penguin Store. It will be reviewed before appearing in the store.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">App Name *</Label>
                    <Input
                      id="name"
                      value={newApp.name}
                      onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                      placeholder="My Awesome App"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (emoji) *</Label>
                    <Input
                      id="icon"
                      value={newApp.icon}
                      onChange={(e) => setNewApp({ ...newApp, icon: e.target.value })}
                      placeholder="🚀"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newApp.description}
                      onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                      placeholder="Describe what your app does..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={newApp.version}
                        onChange={(e) => setNewApp({ ...newApp, version: e.target.value })}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newApp.category}
                        onChange={(e) => setNewApp({ ...newApp, category: e.target.value })}
                        placeholder="utility"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">App Code (React Component) *</Label>
                    <Textarea
                      id="code"
                      value={newApp.app_code}
                      onChange={(e) => setNewApp({ ...newApp, app_code: e.target.value })}
                      placeholder="const MyApp = () => { return <div>Hello World</div>; }; export default MyApp;"
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Write a React component. It will be loaded dynamically when users install your app.
                    </p>
                  </div>
                  <Button onClick={handleCreateApp} className="w-full">
                    <Code className="w-4 h-4 mr-2" />
                    Submit App
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {userApps.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Community Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userApps.map((app) => (
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
                          <span className="text-xs">{app.downloads} downloads</span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>Version {app.version}</span>
                    <span>{app.size}</span>
                  </div>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Featured Apps</h2>
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
