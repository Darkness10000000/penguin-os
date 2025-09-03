export interface WebsiteContent {
  success: boolean;
  url?: string;
  title?: string;
  description?: string;
  content?: string;
  links?: string[];
  images?: string[];
  contentType?: string;
  rawHtml?: string;
  error?: string;
  message?: string;
}

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  inputUrl: string;
  history: string[];
  currentIndex: number;
  isLoading: boolean;
  websiteContent: WebsiteContent | null;
  viewMode: 'rendered' | 'text' | 'links';
}

export const createNewTab = (): BrowserTab => ({
  id: Date.now().toString(),
  url: 'about:home',
  title: 'New Tab',
  inputUrl: '',
  history: ['about:home'],
  currentIndex: 0,
  isLoading: false,
  websiteContent: null,
  viewMode: 'rendered'
});