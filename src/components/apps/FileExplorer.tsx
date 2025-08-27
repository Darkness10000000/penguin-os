import { useState } from 'react';
import { FileItem } from '@/types/system';
import { File, Folder, Home, ChevronRight, Grid, List } from 'lucide-react';

const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const fileSystem: FileItem[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      path: '/home/user/Documents',
      icon: <Folder className="w-6 h-6 text-blue-400" />,
      children: [
        {
          id: '11',
          name: 'README.txt',
          type: 'file',
          path: '/home/user/Documents/README.txt',
          icon: <File className="w-6 h-6 text-gray-400" />,
          content: 'Welcome to PenguinOS!'
        }
      ]
    },
    {
      id: '2',
      name: 'Pictures',
      type: 'folder',
      path: '/home/user/Pictures',
      icon: <Folder className="w-6 h-6 text-blue-400" />,
      children: []
    },
    {
      id: '3',
      name: 'Downloads',
      type: 'folder',
      path: '/home/user/Downloads',
      icon: <Folder className="w-6 h-6 text-blue-400" />,
      children: []
    },
    {
      id: '4',
      name: 'Music',
      type: 'folder',
      path: '/home/user/Music',
      icon: <Folder className="w-6 h-6 text-blue-400" />,
      children: []
    },
    {
      id: '5',
      name: 'Videos',
      type: 'folder',
      path: '/home/user/Videos',
      icon: <Folder className="w-6 h-6 text-blue-400" />,
      children: []
    },
    {
      id: '6',
      name: 'Desktop',
      type: 'folder',
      path: '/home/user/Desktop',
      icon: <Folder className="w-6 h-6 text-blue-400" />,
      children: []
    }
  ];

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.id);
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    }
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-file-bg">
      {/* Toolbar */}
      <div className="h-12 bg-window-header border-b border-window-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <Home className="w-4 h-4 text-foreground/70" />
          </button>
          <div className="flex items-center gap-1 text-sm text-foreground/70">
            {pathParts.map((part, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                <span className="hover:text-foreground cursor-pointer">{part}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10 text-foreground/70'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10 text-foreground/70'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-6 gap-4">
            {fileSystem.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-file-hover transition-colors ${
                  selectedItem === item.id ? 'bg-file-selected text-white' : ''
                }`}
              >
                {item.icon}
                <span className="text-xs text-center break-all">{item.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {fileSystem.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-center gap-3 w-full p-2 rounded hover:bg-file-hover transition-colors ${
                  selectedItem === item.id ? 'bg-file-selected text-white' : ''
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-window-header border-t border-window-border px-4 flex items-center text-xs text-foreground/60">
        {fileSystem.length} items
      </div>
    </div>
  );
};

export default FileExplorer;