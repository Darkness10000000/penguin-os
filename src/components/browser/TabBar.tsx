import { Plus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrowserTab } from './BrowserTab';

interface TabBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const TabBar = ({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: TabBarProps) => {
  return (
    <div className="h-10 bg-window-header border-b border-window-border flex items-center px-2">
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`group flex items-center h-8 px-3 mr-1 rounded-t cursor-pointer transition-colors ${
                tab.id === activeTabId
                  ? 'bg-window-bg'
                  : 'bg-window-header hover:bg-window-bg/50'
              }`}
              onClick={() => onTabSelect(tab.id)}
            >
              <span className="text-xs truncate max-w-[150px] mr-2">
                {tab.title}
              </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 hover:text-destructive" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onNewTab}
            className="h-8 w-8 flex items-center justify-center hover:bg-window-bg/50 rounded transition-colors"
            title="New Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TabBar;