import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Shield, Star, StarOff, MoreVertical, AlertCircle, ExternalLink, History, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const WebBrowser = () => {
  const [url, setUrl] = useState('about:home');
  const [inputUrl, setInputUrl] = useState('');
  const [history, setHistory] = useState<Array<{ url: string; title: string; visitedAt: Date }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<Array<{ id: string; url: string; title: string }>>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [localHistory, setLocalHistory] = useState<string[]>(['about:home']);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadHistory();
        loadBookmarks();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHistory();
        loadBookmarks();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    checkIfBookmarked();
  }, [url, bookmarks]);

  const loadHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('browsing_history')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error loading history:', error);
    } else if (data) {
      setHistory(data.map(item => ({
        url: item.url,
        title: item.title || item.url,
        visitedAt: new Date(item.visited_at)
      })));
    }
  };

  const loadBookmarks = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading bookmarks:', error);
    } else if (data) {
      setBookmarks(data);
    }
  };

  const checkIfBookmarked = () => {
    setIsBookmarked(bookmarks.some(b => b.url === url));
  };

  const addToHistory = async (urlToAdd: string, title?: string) => {
    if (!user || urlToAdd === 'about:home') return;
    
    await supabase
      .from('browsing_history')
      .insert({
        user_id: user.id,
        url: urlToAdd,
        title: title || urlToAdd
      });
    
    await loadHistory();
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to bookmark pages",
        variant: "destructive",
      });
      return;
    }
    
    if (url === 'about:home') return;
    
    if (isBookmarked) {
      const bookmark = bookmarks.find(b => b.url === url);
      if (bookmark) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('id', bookmark.id);
        
        toast({
          title: "Bookmark removed",
          description: "Page removed from bookmarks",
        });
      }
    } else {
      await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          url: url,
          title: getPageTitle(url)
        });
      
      toast({
        title: "Bookmark added",
        description: "Page added to bookmarks",
      });
    }
    
    await loadBookmarks();
  };

  const clearHistory = async () => {
    if (!user) return;
    
    await supabase
      .from('browsing_history')
      .delete()
      .eq('user_id', user.id);
    
    setHistory([]);
    toast({
      title: "History cleared",
      description: "Your browsing history has been cleared",
    });
  };

  const getPageTitle = (url: string) => {
    if (url === 'about:home') return 'Home';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let newUrl = inputUrl;
    
    // Add protocol if missing
    if (newUrl && !newUrl.startsWith('http://') && !newUrl.startsWith('https://') && !newUrl.startsWith('about:')) {
      newUrl = 'https://' + newUrl;
    }
    
    if (newUrl) {
      setUrl(newUrl);
      const newHistory = [...localHistory.slice(0, currentIndex + 1), newUrl];
      setLocalHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      addToHistory(newUrl, getPageTitle(newUrl));
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUrl(localHistory[currentIndex - 1]);
      setInputUrl(localHistory[currentIndex - 1] === 'about:home' ? '' : localHistory[currentIndex - 1]);
    }
  };

  const handleForward = () => {
    if (currentIndex < localHistory.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUrl(localHistory[currentIndex + 1]);
      setInputUrl(localHistory[currentIndex + 1] === 'about:home' ? '' : localHistory[currentIndex + 1]);
    }
  };

  const handleHome = () => {
    const homeUrl = 'about:home';
    setUrl(homeUrl);
    setInputUrl('');
    const newHistory = [...localHistory.slice(0, currentIndex + 1), homeUrl];
    setLocalHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const navigateToUrl = (urlToNavigate: string) => {
    setUrl(urlToNavigate);
    setInputUrl(urlToNavigate === 'about:home' ? '' : urlToNavigate);
    const newHistory = [...localHistory.slice(0, currentIndex + 1), urlToNavigate];
    setLocalHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    addToHistory(urlToNavigate, getPageTitle(urlToNavigate));
    setShowHistory(false);
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
            
            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
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

            {/* Bookmarks */}
            {bookmarks.length > 0 && (
              <div className="w-full max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-3 text-left">Your Bookmarks</h2>
                <div className="grid grid-cols-3 gap-3">
                  {bookmarks.slice(0, 6).map(bookmark => (
                    <button
                      key={bookmark.id}
                      className="p-3 bg-card hover:bg-card/80 rounded-lg transition-colors text-left"
                      onClick={() => navigateToUrl(bookmark.url)}
                    >
                      <div className="truncate text-sm font-medium">{bookmark.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
    <div className="h-full flex flex-col bg-window-bg relative">
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
            disabled={currentIndex === localHistory.length - 1}
            className={`p-1.5 rounded transition-colors ${
              currentIndex === localHistory.length - 1
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
          <button 
            onClick={toggleBookmark}
            className={`p-1.5 hover:bg-white/10 rounded transition-colors ${
              isBookmarked ? 'text-yellow-500' : 'text-foreground/60 hover:text-foreground'
            }`}
            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4 mr-2" />
                {showHistory ? 'Hide' : 'Show'} History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearHistory}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Downloads
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative">
        {renderContent()}
        
        {/* History Panel */}
        {showHistory && (
          <div className="absolute top-0 right-0 w-80 h-full bg-background border-l shadow-lg z-10">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Browsing History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-4 space-y-2">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {user ? 'No history yet' : 'Sign in to save history'}
                  </p>
                ) : (
                  history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToUrl(item.url)}
                      className="w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.url}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.visitedAt.toLocaleString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebBrowser;