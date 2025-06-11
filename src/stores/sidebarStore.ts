
import { create } from 'zustand';
import { OnlineUser, CommentHighlight, TopThread, Poll, SidebarConfig, SiteStats } from '@/types/sidebar';

interface SidebarData {
  stats: SiteStats;
  commentHighlights: CommentHighlight[];
  topThreads: TopThread[];
  polls: Poll[];
  bookmarks: any[];
  changelog: any[];
}

interface SidebarState {
  // Data state
  config: SidebarConfig | null;
  stats: SiteStats | null;
  onlineUsers: OnlineUser[];
  comments: CommentHighlight[];
  threads: TopThread[];
  poll: Poll | null;
  userVote: number | null;
  
  // Loading and error states
  loadingStates: {
    Config: boolean;
    Stats: boolean;
    Users: boolean;
    Comments: boolean;
    Threads: boolean;
    Poll: boolean;
  };
  
  // UI state
  commentCarouselIndex: number;
  isMobileDrawerOpen: boolean;
  changelogHidden: boolean;
  isRulesExpanded: boolean;
  
  // Actions
  setConfig: (config: SidebarConfig | null) => void;
  setStats: (stats: SiteStats | null) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  setComments: (comments: CommentHighlight[]) => void;
  setThreads: (threads: TopThread[]) => void;
  setPoll: (poll: Poll | null) => void;
  setUserVote: (vote: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  setSidebarData: (data: SidebarData) => void;
  setCommentCarouselIndex: (index: number) => void;
  toggleMobileDrawer: () => void;
  hideChangelog: () => void;
  toggleRules: () => void;
  
  // Computed getters
  isLoadingConfig: boolean;
  isLoadingStats: boolean;
  isLoadingUsers: boolean;
  isLoadingComments: boolean;
  isLoadingThreads: boolean;
  isLoadingPoll: boolean;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  // Initial state
  config: null,
  stats: null,
  onlineUsers: [],
  comments: [],
  threads: [],
  poll: null,
  userVote: null,
  loadingStates: {
    Config: false,
    Stats: false,
    Users: false,
    Comments: false,
    Threads: false,
    Poll: false,
  },
  commentCarouselIndex: 0,
  isMobileDrawerOpen: false,
  changelogHidden: false,
  isRulesExpanded: false,
  
  // Actions
  setConfig: (config) => set({ config }),
  setStats: (stats) => set({ stats }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setComments: (comments) => set({ comments, commentCarouselIndex: 0 }),
  setThreads: (threads) => set({ threads }),
  setPoll: (poll) => set({ poll }),
  setUserVote: (userVote) => set({ userVote }),
  setLoading: (loading) => set((state) => ({
    loadingStates: { ...state.loadingStates, Stats: loading }
  })),
  setError: (error) => {
    console.error('Sidebar error:', error);
    // Handle error state appropriately
  },
  setSidebarData: (data) => set({
    stats: data.stats,
    comments: data.commentHighlights,
    threads: data.topThreads,
  }),
  setCommentCarouselIndex: (commentCarouselIndex) => set({ commentCarouselIndex }),
  toggleMobileDrawer: () => set((state) => ({ 
    isMobileDrawerOpen: !state.isMobileDrawerOpen 
  })),
  hideChangelog: () => set({ changelogHidden: true }),
  toggleRules: () => set((state) => ({ 
    isRulesExpanded: !state.isRulesExpanded 
  })),
  
  // Computed getters
  get isLoadingConfig() { return get().loadingStates.Config; },
  get isLoadingStats() { return get().loadingStates.Stats; },
  get isLoadingUsers() { return get().loadingStates.Users; },
  get isLoadingComments() { return get().loadingStates.Comments; },
  get isLoadingThreads() { return get().loadingStates.Threads; },
  get isLoadingPoll() { return get().loadingStates.Poll; },
}));
