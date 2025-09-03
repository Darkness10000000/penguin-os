import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Shield, Star, StarOff, MoreVertical, AlertCircle, ExternalLink, History, Trash2, Loader2, Link2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import TabBar from '@/components/browser/TabBar';
import { BrowserTab, createNewTab, WebsiteContent } from '@/components/browser/BrowserTab';

const WebBrowser = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([createNewTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [globalHistory, setGlobalHistory] = useState<Array<{ url: string; title: string; visitedAt: Date }>>([]);
  const [bookmarks, setBookmarks] = useState<Array<{ id: string; url: string; title: string }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadHistory();
        loadBookmarks();
      }
    });

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
    if (activeTab.url !== 'about:home' && activeTab.url.startsWith('http')) {
      fetchWebsiteContent(activeTab.url);
    }
  }, [activeTab.url]);

  const updateTab = (tabId: string, updates: Partial<BrowserTab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  };

  const fetchWebsiteContent = async (urlToFetch: string) => {
    updateTab(activeTabId, { isLoading: true, websiteContent: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-website', {
        body: { url: urlToFetch }
      });

      if (error) throw error;

      updateTab(activeTabId, { 
        websiteContent: data,
        title: data.title || getPageTitle(urlToFetch)
      });
    } catch (error) {
      console.error('Error fetching website:', error);
      updateTab(activeTabId, {
        websiteContent: {
          success: false,
          error: 'Failed to load website. The site may be blocking access or unavailable.'
        }
      });
    } finally {
      updateTab(activeTabId, { isLoading: false });
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('browsing_history')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(50);
    
    if (!error && data) {
      setGlobalHistory(data.map(item => ({
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
    
    if (!error && data) {
      setBookmarks(data);
    }
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
    
    if (activeTab.url === 'about:home') return;
    
    const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
    
    if (isBookmarked) {
      const bookmark = bookmarks.find(b => b.url === activeTab.url);
      if (bookmark) {
        await supabase.from('bookmarks').delete().eq('id', bookmark.id);
        toast({
          title: "Bookmark removed",
          description: "Page removed from bookmarks",
        });
      }
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        url: activeTab.url,
        title: activeTab.title
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
    
    await supabase.from('browsing_history').delete().eq('user_id', user.id);
    setGlobalHistory([]);
    toast({
      title: "History cleared",
      description: "Your browsing history has been cleared",
    });
  };

  const getPageTitle = (url: string) => {
    if (url === 'about:home') return 'New Tab';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let newUrl = activeTab.inputUrl;
    
    if (newUrl && !newUrl.startsWith('http://') && !newUrl.startsWith('https://') && !newUrl.startsWith('about:')) {
      if (!newUrl.includes('.') || newUrl.includes(' ')) {
        newUrl = `https://www.google.com/search?q=${encodeURIComponent(newUrl)}`;
      } else {
        newUrl = 'https://' + newUrl;
      }
    }
    
    if (newUrl) {
      const newHistory = [...activeTab.history.slice(0, activeTab.currentIndex + 1), newUrl];
      updateTab(activeTabId, {
        url: newUrl,
        history: newHistory,
        currentIndex: newHistory.length - 1
      });
      addToHistory(newUrl, getPageTitle(newUrl));
    }
  };

  const handleBack = () => {
    if (activeTab.currentIndex > 0) {
      const newIndex = activeTab.currentIndex - 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTabId, {
        currentIndex: newIndex,
        url: newUrl,
        inputUrl: newUrl === 'about:home' ? '' : newUrl
      });
    }
  };

  const handleForward = () => {
    if (activeTab.currentIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.currentIndex + 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTabId, {
        currentIndex: newIndex,
        url: newUrl,
        inputUrl: newUrl === 'about:home' ? '' : newUrl
      });
    }
  };

  const handleRefresh = () => {
    if (activeTab.url !== 'about:home' && activeTab.url.startsWith('http')) {
      fetchWebsiteContent(activeTab.url);
    }
  };

  const handleHome = () => {
    const homeUrl = 'about:home';
    const newHistory = [...activeTab.history.slice(0, activeTab.currentIndex + 1), homeUrl];
    updateTab(activeTabId, {
      url: homeUrl,
      inputUrl: '',
      websiteContent: null,
      history: newHistory,
      currentIndex: newHistory.length - 1
    });
  };

  const navigateToUrl = (urlToNavigate: string) => {
    const newHistory = [...activeTab.history.slice(0, activeTab.currentIndex + 1), urlToNavigate];
    updateTab(activeTabId, {
      url: urlToNavigate,
      inputUrl: urlToNavigate === 'about:home' ? '' : urlToNavigate,
      history: newHistory,
      currentIndex: newHistory.length - 1
    });
    addToHistory(urlToNavigate, getPageTitle(urlToNavigate));
    setShowHistory(false);
  };

  const createNewTabHandler = () => {
    const newTab = createNewTab();
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
      setActiveTabId(newActiveTab.id);
    }
  };

  const renderContent = () => {
    if (activeTab.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading website...</p>
        </div>
      );
    }

    if (activeTab.url === 'about:home') {
      return (
        <div className="h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <div className="text-center max-w-2xl px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to PenguinOS Browser</h1>
            <p className="text-muted-foreground mb-8">Your gateway to the web.</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <button onClick={() => navigateToUrl('https://www.google.com')}
                className="p-4 bg-card hover:bg-card/80 rounded-lg transition-colors text-left">
                <h3 className="font-semibold text-foreground mb-1">Google</h3>
                <p className="text-sm text-muted-foreground">Search the web</p>
              </button>
              <button onClick={() => navigateToUrl('https://github.com')}
                className="p-4 bg-card hover:bg-card/80 rounded-lg transition-colors text-left">
                <h3 className="font-semibold text-foreground mb-1">GitHub</h3>
                <p className="text-sm text-muted-foreground">Code & collaborate</p>
              </button>
            </div>

            {bookmarks.length > 0 && (
              <div className="w-full max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-3 text-left">Your Bookmarks</h2>
                <div className="grid grid-cols-3 gap-3">
                  {bookmarks.slice(0, 6).map(bookmark => (
                    <button key={bookmark.id}
                      className="p-3 bg-card hover:bg-card/80 rounded-lg transition-colors text-left"
                      onClick={() => navigateToUrl(bookmark.url)}>
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

    if (!activeTab.websiteContent) return null;

    if (!activeTab.websiteContent.success) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Page</h2>
          <p className="text-muted-foreground mb-4">{activeTab.websiteContent.error}</p>
          <Button onClick={() => window.open(activeTab.url, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      );
    }

    if (activeTab.viewMode === 'text') {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{activeTab.websiteContent.title}</h1>
          {activeTab.websiteContent.description && (
            <p className="text-muted-foreground mb-4">{activeTab.websiteContent.description}</p>
          )}
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{activeTab.websiteContent.content}</p>
          </div>
        </div>
      );
    }

    if (activeTab.viewMode === 'links') {
      return (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Links on this page</h2>
          <div className="space-y-2">
            {activeTab.websiteContent.links?.map((link, index) => (
              <button key={index} onClick={() => navigateToUrl(link)}
                className="block w-full text-left p-2 hover:bg-accent rounded-md transition-colors">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate">{link}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab.websiteContent.rawHtml) {
      return (
        <div className="h-full w-full flex flex-col">
          <div className="bg-muted/50 p-2 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Content fetched securely</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={activeTab.viewMode === 'rendered' ? 'default' : 'outline'}
                onClick={() => updateTab(activeTabId, { viewMode: 'rendered' })}>
                Rendered
              </Button>
              <Button size="sm" variant={activeTab.viewMode === 'text' ? 'default' : 'outline'}
                onClick={() => updateTab(activeTabId, { viewMode: 'text' })}>
                Text
              </Button>
              <Button size="sm" variant={activeTab.viewMode === 'links' ? 'default' : 'outline'}
                onClick={() => updateTab(activeTabId, { viewMode: 'links' })}>
                Links
              </Button>
            </div>
          </div>
          <iframe srcDoc={activeTab.websiteContent.rawHtml} className="flex-1 w-full"
            sandbox="allow-same-origin" title={activeTab.websiteContent.title} />
        </div>
      );
    }

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">{activeTab.websiteContent.title}</h1>
        <p className="text-muted-foreground mb-4">{activeTab.websiteContent.description}</p>
        <div className="prose prose-sm max-w-none">
          <p>{activeTab.websiteContent.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-window-bg">
      <TabBar tabs={tabs} activeTabId={activeTabId} onTabSelect={setActiveTabId}
        onTabClose={closeTab} onNewTab={createNewTabHandler} />

      <div className="bg-window-header border-b border-window-border px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} disabled={activeTab.currentIndex === 0}
            className={`p-1.5 rounded transition-colors ${activeTab.currentIndex === 0 ? 'text-foreground/30 cursor-not-allowed' : 'hover:bg-white/10 text-foreground/60 hover:text-foreground'}`}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button onClick={handleForward} disabled={activeTab.currentIndex === activeTab.history.length - 1}
            className={`p-1.5 rounded transition-colors ${activeTab.currentIndex === activeTab.history.length - 1 ? 'text-foreground/30 cursor-not-allowed' : 'hover:bg-white/10 text-foreground/60 hover:text-foreground'}`}>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={handleRefresh} className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground">
            <RotateCw className="w-4 h-4" />
          </button>
          <button onClick={handleHome} className="p-1.5 hover:bg-white/10 rounded transition-colors text-foreground/60 hover:text-foreground">
            <Home className="w-4 h-4" />
          </button>
          
          <form onSubmit={handleNavigate} className="flex-1 flex items-center">
            <div className="flex-1 flex items-center gap-2 bg-input px-3 py-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-success" />
              <input type="text" value={activeTab.inputUrl}
                onChange={(e) => updateTab(activeTabId, { inputUrl: e.target.value })}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="Search or enter address" />
              {activeTab.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-foreground/40" />
              ) : (
                <Search className="w-4 h-4 text-foreground/40" />
              )}
            </div>
          </form>
          
          <button onClick={toggleBookmark}
            className={`p-1.5 hover:bg-white/10 rounded transition-colors ${bookmarks.some(b => b.url === activeTab.url) ? 'text-yellow-500' : 'text-foreground/60 hover:text-foreground'}`}>
            {bookmarks.some(b => b.url === activeTab.url) ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
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
              <DropdownMenuItem onClick={() => window.open(activeTab.url, '_blank')} disabled={activeTab.url === 'about:home'}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Real Browser
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full">
          {renderContent()}
        </ScrollArea>
        
        {showHistory && (
          <div className="absolute top-0 right-0 w-80 h-full bg-background border-l shadow-lg z-10">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Browsing History</h3>
              <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground">×</button>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-4 space-y-2">
                {globalHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{user ? 'No history yet' : 'Sign in to save history'}</p>
                ) : (
                  globalHistory.map((item, index) => (
                    <button key={index} onClick={() => navigateToUrl(item.url)}
                      className="w-full text-left p-2 hover:bg-accent rounded-md transition-colors">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.url}</div>
                      <div className="text-xs text-muted-foreground">{item.visitedAt.toLocaleString()}</div>
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