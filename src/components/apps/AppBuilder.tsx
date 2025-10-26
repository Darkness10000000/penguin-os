import { useState } from 'react';
import { Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AppBuilder = () => {
  const { toast } = useToast();
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    icon: '',
    version: '1.0.0',
    category: 'utility',
    app_code: ''
  });

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

    setNewApp({
      name: '',
      description: '',
      icon: '',
      version: '1.0.0',
      category: 'utility',
      app_code: ''
    });
  };

  return (
    <div className="h-full w-full overflow-auto bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">App Builder</h1>
          <p className="text-muted-foreground">Create and submit apps to Penguin Store</p>
        </div>

        <div className="space-y-4">
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
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Write a React component. It will be loaded dynamically when users install your app.
            </p>
          </div>
          
          <Button onClick={handleCreateApp} className="w-full" size="lg">
            <Code className="w-4 h-4 mr-2" />
            Submit App for Review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppBuilder;
