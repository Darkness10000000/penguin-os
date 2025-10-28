import { useState } from 'react';
import { Code, Plus, Trash2, Image as ImageIcon, Type, MousePointer, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VNSlide {
  id: string;
  background: string;
  textBoxes: { id: string; text: string; x: number; y: number }[];
  buttons: { id: string; label: string; targetSlideId: string; x: number; y: number }[];
}

const AppBuilder = () => {
  const { toast } = useToast();
  const [appType, setAppType] = useState<'code' | 'vn' | 'preview'>('code');
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    icon: '',
    version: '1.0.0',
    category: 'utility',
    app_code: ''
  });
  
  const [vnSlides, setVnSlides] = useState<VNSlide[]>([
    { id: '1', background: '', textBoxes: [], buttons: [] }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [buttonInputValues, setButtonInputValues] = useState<Record<string, string>>({});
  const [previewSlideId, setPreviewSlideId] = useState('1');
  const [draggedItem, setDraggedItem] = useState<{ type: 'text' | 'button', id: string, offsetX: number, offsetY: number } | null>(null);

  const addSlide = () => {
    if (vnSlides.length >= 150) {
      toast({
        title: "Slide Limit Reached",
        description: "Maximum 150 slides allowed",
        variant: "destructive",
      });
      return;
    }
    const newSlide: VNSlide = {
      id: String(vnSlides.length + 1),
      background: '',
      textBoxes: [],
      buttons: []
    };
    setVnSlides([...vnSlides, newSlide]);
    setCurrentSlideIndex(vnSlides.length);
  };

  const deleteSlide = (index: number) => {
    if (vnSlides.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "Must have at least one slide",
        variant: "destructive",
      });
      return;
    }
    const newSlides = vnSlides.filter((_, i) => i !== index);
    setVnSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, index - 1));
  };

  const updateSlideBackground = (index: number, background: string) => {
    const newSlides = [...vnSlides];
    newSlides[index].background = background;
    setVnSlides(newSlides);
  };

  const addTextBox = (slideIndex: number) => {
    const newSlides = [...vnSlides];
    const newTextBox = {
      id: String(Date.now()),
      text: 'New Text',
      x: 50,
      y: 50
    };
    newSlides[slideIndex].textBoxes.push(newTextBox);
    setVnSlides(newSlides);
  };

  const updateTextBox = (slideIndex: number, textBoxId: string, text: string) => {
    const newSlides = [...vnSlides];
    const textBox = newSlides[slideIndex].textBoxes.find(tb => tb.id === textBoxId);
    if (textBox) textBox.text = text;
    setVnSlides(newSlides);
  };

  const deleteTextBox = (slideIndex: number, textBoxId: string) => {
    const newSlides = [...vnSlides];
    newSlides[slideIndex].textBoxes = newSlides[slideIndex].textBoxes.filter(tb => tb.id !== textBoxId);
    setVnSlides(newSlides);
  };

  const addButton = (slideIndex: number) => {
    const newSlides = [...vnSlides];
    const newButton = {
      id: String(Date.now()),
      label: 'Go On',
      targetSlideId: vnSlides[0].id,
      x: 50,
      y: 80
    };
    newSlides[slideIndex].buttons.push(newButton);
    setVnSlides(newSlides);
    // Initialize input value for new button
    setButtonInputValues(prev => ({ ...prev, [newButton.id]: '1' }));
  };

  const updateButton = (slideIndex: number, buttonId: string, field: 'label' | 'targetSlideId', value: string) => {
    const newSlides = [...vnSlides];
    const button = newSlides[slideIndex].buttons.find(b => b.id === buttonId);
    if (button) button[field] = value;
    setVnSlides(newSlides);
  };

  const deleteButton = (slideIndex: number, buttonId: string) => {
    const newSlides = [...vnSlides];
    newSlides[slideIndex].buttons = newSlides[slideIndex].buttons.filter(b => b.id !== buttonId);
    setVnSlides(newSlides);
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'button', id: string, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left;
    const offsetY = e.clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top;
    setDraggedItem({ type, id, offsetX, offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent, container: HTMLElement) => {
    if (!draggedItem) return;
    
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left - draggedItem.offsetX) / rect.width) * 100;
    const y = ((e.clientY - rect.top - draggedItem.offsetY) / rect.height) * 100;
    
    const slideIndex = vnSlides.findIndex(s => s.id === previewSlideId);
    if (slideIndex === -1) return;
    
    const newSlides = [...vnSlides];
    if (draggedItem.type === 'text') {
      const textBox = newSlides[slideIndex].textBoxes.find(tb => tb.id === draggedItem.id);
      if (textBox) {
        textBox.x = Math.max(0, Math.min(80, x));
        textBox.y = Math.max(0, Math.min(90, y));
      }
    } else {
      const button = newSlides[slideIndex].buttons.find(b => b.id === draggedItem.id);
      if (button) {
        button.x = Math.max(0, Math.min(80, x));
        button.y = Math.max(0, Math.min(90, y));
      }
    }
    setVnSlides(newSlides);
  };

  const handleMouseUp = () => {
    if (draggedItem) {
      toast({
        title: "Position Saved",
        description: "Element position has been updated",
      });
    }
    setDraggedItem(null);
  };

  const generateVNCode = () => {
    return `
const VisualNovel = () => {
  const [currentSlideId, setCurrentSlideId] = React.useState('1');
  
  const slides = ${JSON.stringify(vnSlides, null, 2)};
  
  const currentSlide = slides.find(s => s.id === currentSlideId);
  
  return (
    <div className="h-full w-full relative" style={{ backgroundImage: currentSlide?.background ? \`url(\${currentSlide.background})\` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {currentSlide?.textBoxes.map(tb => (
        <div key={tb.id} className="absolute text-foreground bg-background/80 p-4 rounded" style={{ top: \`\${tb.y}%\`, left: \`\${tb.x}%\` }}>
          {tb.text}
        </div>
      ))}
      {currentSlide?.buttons.map(btn => (
        <button key={btn.id} onClick={() => setCurrentSlideId(btn.targetSlideId)} className="absolute bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90" style={{ top: \`\${btn.y}%\`, left: \`\${btn.x}%\` }}>
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default VisualNovel;`;
  };

  const handleCreateApp = async () => {
    const appCode = appType === 'vn' ? generateVNCode() : newApp.app_code;
    
    if (!newApp.name || !newApp.description || !newApp.icon || !appCode) {
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
        app_code: appCode,
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
    setVnSlides([{ id: '1', background: '', textBoxes: [], buttons: [] }]);
    setCurrentSlideIndex(0);
  };

  const currentSlide = vnSlides[currentSlideIndex];
  const previewSlide = vnSlides.find(s => s.id === previewSlideId);

  return (
    <div className="h-full w-full overflow-auto bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">App Builder</h1>
          <p className="text-muted-foreground">Create and submit apps to Penguin Store</p>
        </div>

        <Tabs value={appType} onValueChange={(v) => setAppType(v as 'code' | 'vn' | 'preview')} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code">Code App</TabsTrigger>
            <TabsTrigger value="vn">Visual Novel</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4 mt-4">
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
          </TabsContent>

          <TabsContent value="vn" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="vn-name">App Name *</Label>
              <Input
                id="vn-name"
                value={newApp.name}
                onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                placeholder="My Visual Novel"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vn-icon">Icon (emoji) *</Label>
              <Input
                id="vn-icon"
                value={newApp.icon}
                onChange={(e) => setNewApp({ ...newApp, icon: e.target.value })}
                placeholder="📖"
                maxLength={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vn-description">Description *</Label>
              <Textarea
                id="vn-description"
                value={newApp.description}
                onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                placeholder="Describe your visual novel story..."
                rows={3}
              />
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Slides ({vnSlides.length}/150)</h3>
                <div className="flex gap-2">
                  <Button onClick={() => { setPreviewSlideId('1'); setAppType('preview'); }} size="sm" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={addSlide} size="sm" disabled={vnSlides.length >= 150}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-20">
                <div className="flex gap-2">
                  {vnSlides.map((slide, index) => (
                    <Button
                      key={slide.id}
                      variant={currentSlideIndex === index ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentSlideIndex(index)}
                      className="relative"
                    >
                      {index + 1}
                      {vnSlides.length > 1 && (
                        <Trash2 
                          className="w-3 h-3 ml-2 hover:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(index);
                          }}
                        />
                      )}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              {currentSlide && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="background">Background Image URL</Label>
                    <Input
                      id="background"
                      value={currentSlide.background}
                      onChange={(e) => updateSlideBackground(currentSlideIndex, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Text Boxes</Label>
                      <Button onClick={() => addTextBox(currentSlideIndex)} size="sm" variant="outline">
                        <Type className="w-4 h-4 mr-2" />
                        Add Text
                      </Button>
                    </div>
                    {currentSlide.textBoxes.map((textBox) => (
                      <div key={textBox.id} className="flex gap-2 items-start border p-2 rounded">
                        <Textarea
                          value={textBox.text}
                          onChange={(e) => updateTextBox(currentSlideIndex, textBox.id, e.target.value)}
                          placeholder="Enter text..."
                          rows={2}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteTextBox(currentSlideIndex, textBox.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Navigation Buttons</Label>
                      <Button onClick={() => addButton(currentSlideIndex)} size="sm" variant="outline">
                        <MousePointer className="w-4 h-4 mr-2" />
                        Add Button
                      </Button>
                    </div>
                    {currentSlide.buttons.map((button) => (
                      <div key={button.id} className="flex gap-2 items-start border p-2 rounded">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={button.label}
                            onChange={(e) => updateButton(currentSlideIndex, button.id, 'label', e.target.value)}
                            placeholder="Button text"
                          />
                          <div className="space-y-1">
                            <Label className="text-xs">Go to Slide (1-{vnSlides.length})</Label>
                            <Input
                              type="number"
                              min="1"
                              max={vnSlides.length}
                              value={buttonInputValues[button.id] ?? (vnSlides.findIndex(s => s.id === button.targetSlideId) + 1)}
                              onChange={(e) => {
                                const value = e.target.value;
                                setButtonInputValues(prev => ({ ...prev, [button.id]: value }));
                                
                                const slideNumber = parseInt(value);
                                if (!isNaN(slideNumber) && slideNumber >= 1 && slideNumber <= vnSlides.length) {
                                  updateButton(currentSlideIndex, button.id, 'targetSlideId', vnSlides[slideNumber - 1].id);
                                }
                              }}
                              placeholder="Enter slide number"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteButton(currentSlideIndex, button.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="mb-2 text-sm text-muted-foreground">
              💡 Drag text boxes and buttons to reposition them
            </div>
            <div 
              className="h-[600px] w-full relative overflow-hidden rounded-lg border select-none" 
              style={{ 
                backgroundImage: previewSlide?.background ? `url(${previewSlide.background})` : 'none', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundColor: previewSlide?.background ? 'transparent' : 'hsl(var(--muted))',
                cursor: draggedItem ? 'grabbing' : 'default'
              }}
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {previewSlide?.textBoxes.map(tb => (
                <div 
                  key={tb.id} 
                  className="absolute text-foreground bg-background/80 p-4 rounded shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary/50" 
                  style={{ 
                    top: `${tb.y}%`, 
                    left: `${tb.x}%`, 
                    maxWidth: '60%',
                    cursor: 'grab'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'text', tb.id, e.currentTarget.parentElement as HTMLElement)}
                >
                  {tb.text}
                </div>
              ))}
              {previewSlide?.buttons.map(btn => (
                <button 
                  key={btn.id} 
                  onMouseDown={(e) => {
                    handleMouseDown(e, 'button', btn.id, e.currentTarget.parentElement as HTMLElement);
                  }}
                  onClick={(e) => {
                    if (!draggedItem) {
                      setPreviewSlideId(btn.targetSlideId);
                    }
                    e.preventDefault();
                  }}
                  className="absolute bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary-foreground/30" 
                  style={{ 
                    top: `${btn.y}%`, 
                    left: `${btn.x}%`,
                    cursor: 'grab'
                  }}
                >
                  {btn.label}
                </button>
              ))}
              {!previewSlide && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No slides to preview. Create a visual novel first.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCreateApp} className="w-full" size="lg">
          <Code className="w-4 h-4 mr-2" />
          Submit App for Review
        </Button>
      </div>
    </div>
  );
};

export default AppBuilder;
