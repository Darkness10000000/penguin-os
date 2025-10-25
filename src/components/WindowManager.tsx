import { useRef } from 'react';
import { Window } from '@/types/system';
import { X, Minus, Square } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';

interface WindowManagerProps {
  windows: Window[];
  activeWindowId: string | null;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
}

const WindowManager = ({
  windows,
  activeWindowId,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition
}: WindowManagerProps) => {
  const isMobile = useIsMobile();
  const dragRef = useRef<{ id: string; startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, window: Window) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    onFocus(window.id);
    dragRef.current = {
      id: window.id,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: window.position.x,
      startPosY: window.position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    onUpdatePosition(dragRef.current.id, {
      x: dragRef.current.startPosX + deltaX,
      y: dragRef.current.startPosY + deltaY
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  // Global mouse event listeners for dragging
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  return (
    <>
      {windows.map((window) => {
        if (window.isMinimized) return null;
        
        const isActive = window.id === activeWindowId;
        
        // On mobile, always fullscreen
        const style = isMobile || window.isMaximized
          ? { top: 0, left: 0, right: 0, bottom: 0, width: 'auto', height: 'auto' }
          : {
              top: window.position.y,
              left: window.position.x,
              width: window.size.width,
              height: window.size.height
            };

        return (
          <div
            key={window.id}
            className={`absolute bg-window-bg rounded-lg overflow-hidden shadow-window transition-all duration-200 ${
              isActive ? 'ring-1 ring-primary/50' : ''
            } ${window.isMaximized ? 'rounded-none' : ''}`}
            style={{ ...style, zIndex: window.zIndex }}
            onClick={() => onFocus(window.id)}
          >
            {/* Window Header */}
            <div
              className={`h-10 bg-gradient-window flex items-center justify-between px-4 ${isMobile ? 'cursor-default' : 'cursor-move'} select-none`}
              onMouseDown={isMobile ? undefined : (e) => handleMouseDown(e, window)}
            >
              <div className="flex items-center gap-2">
                <span className="text-white/60">{window.icon}</span>
                <span className="text-sm font-medium text-white/90 truncate">{window.title}</span>
              </div>
              
              {/* Window Controls */}
              <div className="window-controls flex items-center gap-1">
                {!isMobile && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMinimize(window.id);
                      }}
                      className="w-4 h-4 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors flex items-center justify-center group"
                    >
                      <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMaximize(window.id);
                      }}
                      className="w-4 h-4 rounded-full bg-green-500 hover:bg-green-400 transition-colors flex items-center justify-center group"
                    >
                      <Square className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(window.id);
                  }}
                  className={`${isMobile ? 'w-8 h-8' : 'w-4 h-4'} rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center group`}
                >
                  <X className={`${isMobile ? 'w-4 h-4' : 'w-2 h-2'} text-black/60 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
                </button>
              </div>
            </div>
            
            {/* Window Content */}
            <div className="h-[calc(100%-2.5rem)] overflow-hidden bg-window-bg">
              {window.content}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default WindowManager;