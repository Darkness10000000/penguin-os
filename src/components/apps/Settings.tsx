import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Palette, Monitor, Clock, Info, Sun, Moon, Image, Laptop, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  onClose?: () => void;
}

const Settings: React.FC<SettingsProps> = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState(localStorage.getItem('penguinos-theme') || 'dark');
  const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('penguinos-primary-color') || '220 90 60');
  const [backgroundType, setBackgroundType] = useState(localStorage.getItem('penguinos-bg-type') || 'image');
  const [backgroundColor, setBackgroundColor] = useState(localStorage.getItem('penguinos-bg-color') || '220 20 20');
  const [backgroundImage, setBackgroundImage] = useState(localStorage.getItem('penguinos-bg-image') || '/src/assets/wallpaper.jpg');
  const [autoDateTime, setAutoDateTime] = useState(localStorage.getItem('penguinos-auto-datetime') !== 'false');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState(new Date().toTimeString().slice(0, 5));
  const [deviceName, setDeviceName] = useState(localStorage.getItem('penguinos-device-name') || 'PenguinOS Desktop');

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('penguinos-theme', theme);
  }, [theme]);

  // Apply primary color changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    localStorage.setItem('penguinos-primary-color', primaryColor);
  }, [primaryColor]);

  // Apply background changes
  useEffect(() => {
    const desktop = document.querySelector('.desktop-background') as HTMLElement;
    if (!desktop) return;

    if (backgroundType === 'color') {
      desktop.style.background = `hsl(${backgroundColor})`;
      desktop.style.backgroundImage = 'none';
    } else {
      desktop.style.backgroundImage = `url(${backgroundImage})`;
      desktop.style.backgroundSize = 'cover';
      desktop.style.backgroundPosition = 'center';
    }
    
    localStorage.setItem('penguinos-bg-type', backgroundType);
    localStorage.setItem('penguinos-bg-color', backgroundColor);
    localStorage.setItem('penguinos-bg-image', backgroundImage);
  }, [backgroundType, backgroundColor, backgroundImage]);

  // Save date/time settings
  useEffect(() => {
    localStorage.setItem('penguinos-auto-datetime', autoDateTime.toString());
    if (!autoDateTime) {
      localStorage.setItem('penguinos-manual-date', manualDate);
      localStorage.setItem('penguinos-manual-time', manualTime);
    }
  }, [autoDateTime, manualDate, manualTime]);

  // Save device name
  useEffect(() => {
    localStorage.setItem('penguinos-device-name', deviceName);
  }, [deviceName]);

  const handleApplySettings = () => {
    toast({
      title: "Settings Applied",
      description: "Your system settings have been updated successfully.",
    });
  };

  const handleDownloadApp = () => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => {
          toast({
            title: "Download Ready",
            description: "You can now install PenguinOS as a standalone app. Use your browser's install option or add to home screen.",
          });
          
          // Trigger browser's install prompt if available
          if ((window as any).deferredPrompt) {
            (window as any).deferredPrompt.prompt();
          }
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
          toast({
            title: "Download Error",
            description: "Failed to prepare app for download. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers that don't support service workers
      toast({
        title: "Download Instructions",
        description: "Add this page to your home screen or bookmarks to use it as an app.",
      });
    }
  };

  const predefinedColors = [
    { name: 'Blue', value: '220 90 60' },
    { name: 'Green', value: '140 80 50' },
    { name: 'Purple', value: '270 70 60' },
    { name: 'Orange', value: '30 90 60' },
    { name: 'Red', value: '0 85 60' },
    { name: 'Teal', value: '180 70 50' },
  ];

  const predefinedBackgrounds = [
    '/src/assets/wallpaper.jpg',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920',
    'https://images.unsplash.com/photo-1516617442634-75371039cb3a?w=1920',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920',
  ];

  return (
    <div className="w-full h-full bg-background text-foreground p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="personalization">Personalization</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup value={theme} onValueChange={setTheme}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                        <Sun className="w-4 h-4" />
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                        <Moon className="w-4 h-4" />
                        Dark
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setPrimaryColor(color.value)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          primaryColor === color.value ? 'border-foreground scale-110' : 'border-border'
                        }`}
                        style={{ backgroundColor: `hsl(${color.value})` }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  About your PenguinOS system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">OS Version</span>
                  <span className="font-mono">PenguinOS 1.0.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Kernel</span>
                  <span className="font-mono">5.15.0-penguin</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Device Name</span>
                  <Input 
                    value={deviceName} 
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-48"
                  />
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Architecture</span>
                  <span className="font-mono">x86_64</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Desktop Environment</span>
                  <span className="font-mono">PenguinDE</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Background
                </CardTitle>
                <CardDescription>
                  Customize your desktop background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Background Type</Label>
                  <RadioGroup value={backgroundType} onValueChange={setBackgroundType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="bg-image" />
                      <Label htmlFor="bg-image" className="cursor-pointer">Image</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="color" id="bg-color" />
                      <Label htmlFor="bg-color" className="cursor-pointer">Solid Color</Label>
                    </div>
                  </RadioGroup>
                </div>

                {backgroundType === 'image' ? (
                  <div className="space-y-2">
                    <Label>Select Wallpaper</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {predefinedBackgrounds.map((bg, index) => (
                        <button
                          key={index}
                          onClick={() => setBackgroundImage(bg)}
                          className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            backgroundImage === bg ? 'border-primary scale-105' : 'border-border'
                          }`}
                        >
                          <img 
                            src={bg} 
                            alt={`Wallpaper ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Custom Image URL</Label>
                      <Input 
                        value={backgroundImage}
                        onChange={(e) => setBackgroundImage(e.target.value)}
                        placeholder="Enter image URL..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Background Color (HSL)</Label>
                    <Input 
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="e.g., 220 20 20"
                    />
                    <div 
                      className="w-full h-20 rounded-lg border-2 border-border"
                      style={{ backgroundColor: `hsl(${backgroundColor})` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Date & Time
                </CardTitle>
                <CardDescription>
                  Configure your system's date and time settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-datetime">Automatic Date & Time</Label>
                  <Switch 
                    id="auto-datetime"
                    checked={autoDateTime}
                    onCheckedChange={setAutoDateTime}
                  />
                </div>

                {!autoDateTime && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input 
                        type="time"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Current Time: {new Date().toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Laptop className="w-5 h-5" />
                  System
                </CardTitle>
                <CardDescription>
                  Advanced system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  More system settings will be available in future updates.
                </p>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Download PenguinOS</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Install PenguinOS as a standalone app on your device
                      </p>
                    </div>
                    <Button onClick={handleDownloadApp} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download App
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleApplySettings}>
            Apply Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;