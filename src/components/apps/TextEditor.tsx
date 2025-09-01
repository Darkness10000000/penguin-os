import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface TextEditorProps {
  initialContent?: string;
  fileName?: string;
  onClose?: () => void;
}

const TextEditor = ({ initialContent = '', fileName = 'Untitled.txt', onClose }: TextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    // Save to localStorage for now
    localStorage.setItem(`file_${fileName}`, content);
    setIsDirty(false);
    toast({
      title: "File saved",
      description: `${fileName} has been saved successfully.`,
    });
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{fileName}</span>
          {isDirty && <span className="text-xs text-muted-foreground">(unsaved)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-8"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full h-full resize-none font-mono text-sm bg-background border-0 focus-visible:ring-0"
          placeholder="Start typing..."
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Lines: {content.split('\n').length}</span>
          <span>Characters: {content.length}</span>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;