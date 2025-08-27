import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Shield, Star, MoreVertical } from 'lucide-react';

const WebBrowser = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let newUrl = inputUrl;
    
    // Add protocol if missing
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    
    setUrl(newUrl);
    setInputUrl(newUrl);
    setIsLoading(true);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = url;
    }
  };

  const handleHome = () => {
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    setInputUrl(homeUrl);
  };

  return (
    <div className="h-full flex flex-col bg-window-bg">
      {/* Browser Toolbar */}
      <div className="h-16 bg-window-header border-b border-window-border px-3 py-2 space-y-2">
        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleHome}
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
          
          {/* URL Bar */}
          <form onSubmit={handleNavigate} className="flex-1 flex items-center">
            <div className="flex-1 flex items-center gap-2 bg-input px-3 py-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-success" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="Search or enter address"
              />
              <Search className="w-4 h-4 text-foreground/40" />
            </div>
          </form>
          
          {/* Browser Actions */}
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-window-bg flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="Web Browser"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </div>
  );
};

export default WebBrowser;