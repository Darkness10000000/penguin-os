import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Shield, Star, MoreVertical, AlertCircle, ExternalLink } from 'lucide-react';

const WebBrowser = () => {
  const [url, setUrl] = useState('about:home');
  const [inputUrl, setInputUrl] = useState('');
  const [history, setHistory] = useState<string[]>(['about:home']);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let newUrl = inputUrl;
    
    // Add protocol if missing
    if (newUrl && !newUrl.startsWith('http://') && !newUrl.startsWith('https://') && !newUrl.startsWith('about:')) {
      newUrl = 'https://' + newUrl;
    }
    
    if (newUrl) {
      setUrl(newUrl);
      const newHistory = [...history.slice(0, currentIndex + 1), newUrl];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUrl(history[currentIndex - 1]);
      setInputUrl(history[currentIndex - 1] === 'about:home' ? '' : history[currentIndex - 1]);
    }
  };

  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUrl(history[currentIndex + 1]);
      setInputUrl(history[currentIndex + 1] === 'about:home' ? '' : history[currentIndex + 1]);
    }
  };

  const handleHome = () => {
    const homeUrl = 'about:home';
    setUrl(homeUrl);
    setInputUrl('');
    const newHistory = [...history.slice(0, currentIndex + 1), homeUrl];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const renderContent = () => {
    if (url === 'about:home') {
      return (
        <div className="h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <div className="text-center max-w-2xl px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to PenguinOS Browser</h1>
            <p className="text-muted-foreground mb-8">
              Your gateway to the web. Fast, secure, and privacy-focused.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button 
                onClick={() => openInNewTab('https://www.google.com')}
                className="p-4 bg-card hover:bg-card/80 rounded-lg transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground mb-1">Google</h3>
                <p className="text-sm text-muted-foreground">Search the web</p>
              </button>
              <button 
                onClick={() => openInNewTab('https://github.com')}
                className="p-4 bg-card hover:bg-card/80 rounded-lg transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground mb-1">GitHub</h3>
                <p className="text-sm text-muted-foreground">Code & collaborate</p>
              </button>
              <button 
                onClick={() => openInNewTab('https://developer.mozilla.org')}
                className="p-4 bg-card hover:bg-card/80 rounded-lg transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground mb-1">MDN</h3>
                <p className="text-sm text-muted-foreground">Web documentation</p>
              </button>
              <button 
                onClick={() => openInNewTab('https://stackoverflow.com')}
                className="p-4 bg-card hover:bg-card/80 rounded-lg transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground mb-1">Stack Overflow</h3>
                <p className="text-sm text-muted-foreground">Developer Q&A</p>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // For external URLs, show iframe limitation message
    return (
      <div className="h-full bg-card flex items-center justify-center">
        <div className="text-center max-w-lg px-8">
          <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Website Cannot Be Displayed</h2>
          <p className="text-muted-foreground mb-6">
            Due to security restrictions, external websites like <span className="font-semibold">{url}</span> cannot be displayed within this browser simulation.
            Most websites prevent being embedded in iframes for security reasons (X-Frame-Options).
          </p>
          <button
            onClick={() => openInNewTab(url)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </button>
          <p className="text-sm text-muted-foreground mt-4">
            The website will open in your actual browser.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-window-bg">
      {/* Browser Toolbar */}
      <div className="h-16 bg-window-header border-b border-window-border px-3 py-2 space-y-2">
        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`p-1.5 rounded transition-colors ${
              currentIndex === 0 
                ? 'text-foreground/30 cursor-not-allowed' 
                : 'hover:bg-white/10 text-foreground/60 hover:text-foreground'
            }`}
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleForward}
            disabled={currentIndex === history.length - 1}
            className={`p-1.5 rounded transition-colors ${
              currentIndex === history.length - 1
                ? 'text-foreground/30 cursor-not-allowed'
                : 'hover:bg-white/10 text-foreground/60 hover:text-foreground'
            }`}
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
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
      <div className="flex-1 relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default WebBrowser;